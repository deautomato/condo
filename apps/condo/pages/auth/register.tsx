import { useIntl } from '@core/next/intl'
import { FormattedMessage } from 'react-intl'
import Router from 'next/router'

import { Col, Form, Input, Row, Typography } from 'antd'
import { Button } from '@condo/domains/common/components/Button'
import AuthLayout, { AuthLayoutContext, AuthPage } from '@condo/domains/common/components/containers/BaseLayout/AuthLayout'
import React, { createContext, useEffect, useState, useRef, useContext } from 'react'
import { REGISTER_NEW_USER_MUTATION } from '@condo/domains/user/gql'

import { formatPhone } from '@condo/domains/common/utils/helpers'
import MaskedInput from 'antd-mask-input'
import { AUTH as firebaseAuth, initRecaptcha, resetRecaptcha, IS_FIREBASE_CONFIG_VALID } from '@condo/domains/common/utils/firebase.front.utils'
import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { useAuth } from '@core/next/auth'
import { useMutation } from '@core/next/apollo'
import { runMutation } from '@condo/domains/common/utils/mutations.utils'
import { ALREADY_REGISTERED, MIN_PASSWORD_LENGTH_ERROR, EMAIL_ALREADY_REGISTERED_ERROR } from '@condo/domains/user/constants/errors'

import { colors } from '@condo/domains/common/constants/style'
const LINK_STYLE = { color: colors.sberPrimary[7] }


const INPUT_STYLE = { minWidth: '12em', maxWidth: '20em' }
const POLICY_LOCATION = '/policy.pdf'
const SMS_CODE_LENGTH = 6




const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    sendCode: async (phone: string) => null,
    verifyCode: async (code: string) => null,
    signout: () => null,
    phone: '',
})
declare global {
    interface Window {
        recaptchaVerifier: unknown
    }
}

const Auth = ({ children }): React.ReactElement => {
    const [user, setUser] = useState(null)
    const intl = useIntl()
    const ClientSideErrorMsg = intl.formatMessage({ id: 'ClientSideError' })
    const recaptchaVerifier = useRef(null)
    const [, setCaptcha] = useState('')
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [phone, setPhone] = useState('')

    useEffect(() => {
        if (!IS_FIREBASE_CONFIG_VALID) {
            throw new Error(ClientSideErrorMsg)
        }
        recaptchaVerifier.current = initRecaptcha(setCaptcha, setCaptcha)
        if (typeof window !== 'undefined') {
            window.recaptchaVerifier = recaptchaVerifier.current
        }
        return () => {
            recaptchaVerifier.current.clear()
            setCaptcha(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function sendCode (phoneNumber) {
        setPhone(phoneNumber)
        const confirmation = await firebaseAuth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier.current)
        setConfirmationResult(confirmation)
    }

    async function verifyCode (verificationCode) {
        const result = await confirmationResult.confirm(verificationCode)
        result.user.token = await result.user.getIdToken(true)
        setUser(result.user)
    }

    async function signout () {
        return await firebaseAuth().signOut()
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(user),
                user,
                sendCode,
                verifyCode,
                signout,
                phone,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

const RegisterSteps = (): React.ReactElement => {
    const [state, setState] = useState('inputPhone')
    const steps = {
        inputPhone: <InputPhoneForm onFinish={() => setState('validatePhone')}/>,
        validatePhone: <ValidatePhoneForm onFinish={() => setState('register')} onReset={() => setState('inputPhone')}/>,
        register: <RegisterForm onFinish={() => null}/>,
    }
    return steps[state]
}

// Todo(zuch): responsive HTML
const RegisterPage: AuthPage = () => {
    const intl = useIntl()
    const RegistrationTitleMsg = intl.formatMessage({ id: 'pages.auth.RegistrationTitle' })

    return (
        <Auth>
            <div style={{ textAlign: 'center', display: 'inline-block', maxWidth: '512px' }}>
                <Typography.Title style={{ textAlign: 'left' }}>{RegistrationTitleMsg}</Typography.Title>
                <RegisterSteps/>
            </div>
        </Auth>
    )
}


interface IInputPhoneFormProps {
    onFinish: () => void
}

const InputPhoneForm = ({ onFinish }): React.ReactElement<IInputPhoneFormProps> => {
    const [form] = Form.useForm()
    const intl = useIntl()
    const PhoneMsg = intl.formatMessage({ id: 'pages.auth.register.field.Phone' })
    const RegisterHelpMessage = intl.formatMessage({ id: 'pages.auth.reset.RegisterHelp' })
    const UserAgreementFileName = intl.formatMessage({ id: 'pages.auth.register.info.UserAgreementFileName' })
    const ExamplePhoneMsg = intl.formatMessage({ id: 'example.Phone' })
    const FieldIsRequiredMsg = intl.formatMessage({ id: 'FieldIsRequired' })
    const { phone, sendCode } = useContext(AuthContext)

    async function handleSendCode () {
        const { phone } = await form.validateFields(['phone'])
        try {
            await sendCode(phone)
            onFinish()
        } catch (error) {
            /*
            const authErrors = [
                'auth/invalid-phone-number',
                'auth/missing-phone-number',
                'auth/too-many-requests',
            ]
            */
            console.error('send sms error ', error)
            resetRecaptcha()
        }
    }

    const RegisterMsg = intl.formatMessage({ id: 'Register' })
    return (
        <>
            <Typography.Paragraph style={{ textAlign: 'left', fontSize: '16px' }}>{RegisterHelpMessage}</Typography.Paragraph>
            <Form
                form={form}
                name="register-input-phone"
                onFinish={handleSendCode}
                colon={false}
                style={{ marginTop: '40px' }}
                initialValues={{ phone }}
            >
                <Row gutter={[0, 24]}>
                    <Col span={24}>
                        <Form.Item
                            name="phone"
                            label={PhoneMsg}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                            rules={[{ required: true, message: FieldIsRequiredMsg }]}
                        >
                            <MaskedInput mask='+1 (111) 111-11-11' value={phone} placeholder={ExamplePhoneMsg} style={{ ...INPUT_STYLE }} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Typography.Paragraph style={{ textAlign: 'left', fontSize: '12px', marginTop: '12px', lineHeight: '20px' }}>
                            <FormattedMessage
                                id='pages.auth.register.info.UserAgreement'
                                values={{
                                    link: <a style={LINK_STYLE} target='_blank' href={POLICY_LOCATION} rel="noreferrer">{UserAgreementFileName}</a>,
                                }}
                            />
                        </Typography.Paragraph>
                    </Col>
                    <Col span={24}>
                        <Form.Item style={{ textAlign: 'left', marginTop: '24px' }}>
                            <Button
                                key='submit'
                                type='sberPrimary'
                                htmlType='submit'
                            >
                                {RegisterMsg}
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

interface IValidatePhoneFormProps {
    onFinish: () => void
    onReset: () => void
}

const ValidatePhoneForm = ({ onFinish, onReset }): React.ReactElement<IValidatePhoneFormProps> => {
    const [form] = Form.useForm()
    const initialValues = { smscode: '' }
    const intl = useIntl()
    const ChangePhoneNumberLabel = intl.formatMessage({ id: 'pages.auth.register.ChangePhoneNumber' })
    const FieldIsRequiredMsg = intl.formatMessage({ id: 'FieldIsRequired' })
    const SmsCodeTitle = intl.formatMessage({ id: 'pages.auth.register.field.SmsCode' })
    const [isPhoneVisible, setisPhoneVisible] = useState(false)
    const PhoneToggleLabel = isPhoneVisible ? intl.formatMessage({ id: 'Hide' }) : intl.formatMessage({ id: 'Show' })
    const { verifyCode, signout, phone } = useContext(AuthContext)
    const [showPhone, setShowPhone] = useState(phone)
    useEffect(() => {
        if (isPhoneVisible) {
            setShowPhone(formatPhone(phone))
        } else {
            const unHidden = formatPhone(phone)
            setShowPhone(`${unHidden.substring(0, 9)}***${unHidden.substring(12)}`)
        }
    }, [isPhoneVisible, phone, setShowPhone])

    async function handleVerifyCode () {
        const { smscode } = await form.validateFields(['smscode'])
        if (smscode.toString().length < SMS_CODE_LENGTH) {
            return
        }
        try {
            await verifyCode(smscode)
            onFinish()
        } catch (error) {
            console.error('verify error ', error)
            resetRecaptcha()
        }
    }

    async function resetPhone () {
        await signout()
        resetRecaptcha()
        onReset()
    }

    return (
        <>
            <Typography.Paragraph style={{ textAlign: 'left' }}>
                <FormattedMessage
                    id='pages.auth.register.info.SmsCodeSent'
                    values={{
                        phone: <span>{showPhone} <a style={LINK_STYLE} onClick={() => setisPhoneVisible(!isPhoneVisible)}>({PhoneToggleLabel})</a></span>,
                    }}
                />
            </Typography.Paragraph>
            <Form
                form={form}
                name="register-verify-code"
                onFinish={onFinish}
                initialValues={initialValues}
                colon={false}
                style={{ marginTop: '40px' }}
            >
                <Row gutter={[0, 24]}>
                    <Col span={24}>
                        <Form.Item
                            name="smscode"
                            label={SmsCodeTitle}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                            rules={[{ required: true, message: FieldIsRequiredMsg }]}
                        >
                            <Input onChange={handleVerifyCode} style={INPUT_STYLE} />
                        </Form.Item>
                    </Col>
                    <Col span={24} >
                        <Typography.Paragraph style={{ textAlign: 'left', marginTop: '32px' }}>
                            <a style={{ ...LINK_STYLE, fontSize: '12px', lineHeight: '20px' }} onClick={resetPhone}>{ChangePhoneNumberLabel}</a>
                        </Typography.Paragraph>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

interface IRegisterFormProps {
    onFinish: () => void
}

const RegisterForm = ({ onFinish }): React.ReactElement<IRegisterFormProps> => {
    const [form] = Form.useForm()
    const { user } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(false)
    const { signin } = useAuth()
    const initialValues = { phone: user.phoneNumber, firebaseIdToken: user.token }
    const intl = useIntl()
    const RegisterMsg = intl.formatMessage({ id: 'Register' })
    const PhoneMsg = intl.formatMessage({ id: 'pages.auth.register.field.Phone' })
    const ExamplePhoneMsg = intl.formatMessage({ id: 'example.Phone' })
    const ExampleNameMsg = intl.formatMessage({ id: 'example.Name' })
    const EmailPlaceholder = intl.formatMessage({ id: 'example.Email' })
    const PleaseInputYourEmailMsg = intl.formatMessage({ id: 'pages.auth.PleaseInputYourEmail' })
    const NameMsg = intl.formatMessage({ id: 'pages.auth.register.field.Name' })
    const PasswordMsg = intl.formatMessage({ id: 'pages.auth.register.field.Password' })
    const ConfirmPasswordMsg = intl.formatMessage({ id: 'pages.auth.register.field.ConfirmPassword' })
    const EmailMsg = intl.formatMessage({ id: 'pages.auth.register.field.Email' })
    const PleaseInputYourPasswordMsg = intl.formatMessage({ id: 'pages.auth.PleaseInputYourPassword' })
    const AllFieldsAreRequired = intl.formatMessage({ id: 'pages.auth.register.AllFieldsAreRequired' })
    const PhoneIsAlreadyRegisteredMsg = intl.formatMessage({ id: 'pages.auth.PhoneIsAlreadyRegistered' })
    const PasswordIsTooShortMsg = intl.formatMessage({ id: 'pages.auth.PasswordIsTooShort' })
    const PleaseInputYourNameMsg = intl.formatMessage({ id: 'pages.auth.PleaseInputYourName' })
    const EmailIsNotValidMsg = intl.formatMessage({ id: 'pages.auth.EmailIsNotValid' })
    const PleaseConfirmYourPasswordMsg = intl.formatMessage({ id: 'pages.auth.PleaseConfirmYourPassword' })
    const TwoPasswordDontMatchMsg = intl.formatMessage({ id: 'pages.auth.TwoPasswordDontMatch' })
    const EmailIsAlreadyRegisteredMsg = intl.formatMessage({ id: 'pages.auth.EmailIsAlreadyRegistered' })

    const ErrorToFormFieldMsgMapping = {
        [ALREADY_REGISTERED]: {
            name: 'phone',
            errors: [PhoneIsAlreadyRegisteredMsg],
        },
        [EMAIL_ALREADY_REGISTERED_ERROR]: {
            name: 'email',
            errors: [EmailIsAlreadyRegisteredMsg],
        },
        [MIN_PASSWORD_LENGTH_ERROR]: {
            name: 'password',
            errors: [PasswordIsTooShortMsg],
        },

    }
    const [register] = useMutation(REGISTER_NEW_USER_MUTATION)
    const registerComplete = values => {
        const registerExtraData = {
            dv: 1,
            sender: getClientSideSenderInfo(),
        }
        if (values.email) {
            values.email = values.email.toLowerCase().trim()
        }
        const { name, email, password, firebaseIdToken } = values
        const data = { name, email, password, firebaseIdToken, ...registerExtraData }
        setIsLoading(true)
        return runMutation({
            mutation: register,
            variables: { data: data },
            onCompleted: () => {
                signin({ variables: form.getFieldsValue() }).then(() => { Router.push('/') }, console.error)
            },
            onFinally: () => {
                setIsLoading(false)
            },
            intl,
            form,
            ErrorToFormFieldMsgMapping,
        })
    }
    return (
        <div>
            <Typography.Paragraph style={{ textAlign: 'left', fontSize: '12px' }} >{AllFieldsAreRequired}</Typography.Paragraph>
            <Form
                form={form}
                name="register"
                onFinish={registerComplete}
                initialValues={initialValues}
                colon={false}
                style={{ marginTop: '40px' }}
            >
                <Row gutter={[0, 24]}>
                    <Col span={24}>
                        <Form.Item
                            name="phone"
                            label={PhoneMsg}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                        >
                            <MaskedInput disabled={true} mask='+1 (111) 111-11-11' placeholder={ExamplePhoneMsg} style={{ ...INPUT_STYLE }} />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label={NameMsg}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                            rules={[{ required: true, message: PleaseInputYourNameMsg, whitespace: true }]}
                        >
                            <Input placeholder={ExampleNameMsg} style={INPUT_STYLE} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="email"
                            label={EmailMsg}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                            rules={[
                                {
                                    type: 'email',
                                    message: EmailIsNotValidMsg,
                                },
                                {
                                    required: true,
                                    message: PleaseInputYourEmailMsg,
                                },
                            ]}
                        >
                            <Input placeholder={EmailPlaceholder} style={INPUT_STYLE} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="password"
                            label={PasswordMsg}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                            rules={[
                                {
                                    required: true,
                                    message: PleaseInputYourPasswordMsg,
                                },
                                {
                                    min: 7,
                                    message: PasswordIsTooShortMsg,
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password style={INPUT_STYLE} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="confirm"
                            label={ConfirmPasswordMsg}
                            labelAlign='left'
                            style={{ textAlign: 'right' }}
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: PleaseConfirmYourPasswordMsg,
                                },
                                ({ getFieldValue }) => ({
                                    validator (rule, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(TwoPasswordDontMatchMsg)
                                    },
                                }),
                            ]}
                        >
                            <Input.Password style={INPUT_STYLE}/>
                        </Form.Item>
                    </Col>
                    <Form.Item
                        name="firebaseIdToken"
                        noStyle={true}
                    >
                        <Input disabled={true} hidden={true}/>
                    </Form.Item>
                    <Col span={24}>
                        <Form.Item style={{ textAlign: 'left', marginTop: '36px' }}>
                            <Button
                                key='submit'
                                onClick={onFinish}
                                type='sberPrimary'
                                htmlType='submit'
                                loading={isLoading}
                            >
                                {RegisterMsg}
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}


const HeaderAction = (): React.ReactElement => {
    const intl = useIntl()
    const AllreadyRegisteredTitle = intl.formatMessage({ id: 'pages.auth.AlreadyRegistered' })
    const { isMobile } = useContext(AuthLayoutContext)
    return (
        <Button
            key='submit'
            onClick={() => Router.push('/auth/signin')}
            type='sberPrimary'
            secondary={true}
            size={isMobile ? 'middle' : 'large'}
        >
            {AllreadyRegisteredTitle}
        </Button>
    )
}

RegisterPage.headerAction = <HeaderAction/>

RegisterPage.container = AuthLayout

export default RegisterPage
