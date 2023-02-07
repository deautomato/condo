import { Layout, Menu, Row, Col } from 'antd'
import { DEFAULT_LOCALE } from 'domains/common/constants/locales'
import { useMenuItems } from 'domains/docs/hooks/useMenuItems'
import { getNavTree, getAllRoutes, getFlatArticles } from 'domains/docs/utils/routing'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { CSSProperties, useMemo } from 'react'

import { Typography } from '@open-condo/ui'
import { colors } from '@open-condo/ui/colors'

import styles from './path.module.css'

import type { RowProps } from 'antd'
import type { NavItem, ArticleInfo } from 'domains/docs/utils/routing'
import type { GetStaticPaths, GetStaticProps } from 'next'

const DOCS_ROOT_FOLDER = 'docs'
const DOCS_ROOT_ENDPOINT = '/docs'
const SIDER_WIDTH = 336
const TITLE_GUTTER: RowProps['gutter'] = [40, 40]

const SIDER_STYLES: CSSProperties = {
    minHeight: 'calc(100vh - 72px)',
    padding: '28px 20px',
}

const CONTENT_STYLES: CSSProperties = {
    minHeight: 'calc(100vh - 72px)',
    padding: '40px 48px 0 20px',
    background: colors.white,
}

type DocPageProps = {
    navigation: Array<NavItem>
    pageTitle: string
    nextPage: ArticleInfo | null
    prevPage: ArticleInfo | null
}

const DocPage: React.FC<DocPageProps> = ({ navigation, pageTitle }) => {
    const router = useRouter()
    const currentRoute = router.asPath.split('?')[0]
    const menuItems = useMenuItems(navigation, DOCS_ROOT_ENDPOINT)

    // /path/subpath/page -> ['/path', '/path/subpath']
    const openPaths = useMemo(() => {
        const parts = currentRoute.split('/').filter(Boolean)
        const result = []
        for (let i = 0; i < parts.length - 2; ++i) {
            const route = `/${parts.slice(0, parts.length - (i + 1)).join('/')}`
            result.push(route)
        }

        return result
    }, [currentRoute])

    return (
        <Layout hasSider>
            <Layout.Sider width={SIDER_WIDTH} style={SIDER_STYLES} theme='light'>
                <Menu
                    mode='inline'
                    items={menuItems}
                    defaultOpenKeys={openPaths}
                    defaultSelectedKeys={[currentRoute]}
                    selectedKeys={[currentRoute]}
                />
            </Layout.Sider>
            <Layout.Content style={CONTENT_STYLES}>
                <div className={styles.pageContainer}>
                    <div className={styles.articleColumn}>
                        <Row gutter={TITLE_GUTTER}>
                            <Col span={24}>
                                <Typography.Title>{pageTitle}</Typography.Title>
                            </Col>
                            <Col span={24}>
                                <Typography.Text>123123</Typography.Text>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.tableOfContentsColumn}></div>
                </div>
            </Layout.Content>
        </Layout>
    )
}

export default DocPage

type GetStaticPathParams = {
    path: Array<string>
}

export const getStaticPaths: GetStaticPaths<GetStaticPathParams> = ({ locales = [] }) => {
    return {
        paths: locales.flatMap(locale => {
            return Array.from(getAllRoutes(DOCS_ROOT_FOLDER, locale, DOCS_ROOT_FOLDER), (route) => ({
                params: { path: route.split('/') },
                locale,
            }))
        }),
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps<DocPageProps, GetStaticPathParams> = ({ locale = DEFAULT_LOCALE, params }) => {
    const navTree = getNavTree(DOCS_ROOT_FOLDER, locale, DOCS_ROOT_FOLDER)

    const articles = Array.from(getFlatArticles(navTree))
    const route = get(params, 'path', []).join('/')
    const pageIndex = articles.findIndex((item) => item.route === route)

    const pageTitle = articles[pageIndex].label
    const prevPage = pageIndex > 0 ? articles[pageIndex - 1] : null
    const nextPage = (pageIndex < articles.length - 1 && pageIndex != -1) ? articles[pageIndex + 1] : null

    return {
        props: {
            navigation: navTree,
            prevPage,
            nextPage,
            pageTitle,
        },
    }
}