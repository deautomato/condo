/** @jsx jsx */
import {
    OrganizationEmployeeRole,
    PropertyWhereInput,
    Property as PropertyType,
    SortPropertiesBy,
} from '@app/condo/schema'
import { jsx } from '@emotion/react'
import { Col, Radio, Row, RowProps, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { CSSProperties, useCallback, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'

import {
    PageWrapper,
    useLayoutContext,
} from '@condo/domains/common/components/containers/BaseLayout'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'
import PropertiesMap from '@condo/domains/common/components/PropertiesMap'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { parseQuery } from '@condo/domains/common/utils/tables.utils'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import BuildingsTable from '@condo/domains/property/components/BuildingsTable'
import { useTableColumns as usePropertiesTableColumns } from '@condo/domains/property/hooks/useTableColumns'
import { useTableFilters as usePropertyTableFilters } from '@condo/domains/property/hooks/useTableFilters'

type PropertiesType = 'buildings'

type PropertiesContentProps = {
    role: OrganizationEmployeeRole
    searchPropertiesQuery: PropertyWhereInput
    propertiesTableColumns: ColumnsType
    sortPropertiesBy: SortPropertiesBy[]
    loading?: boolean
    canDownloadProperties?: boolean
}

const PAGE_ROW_GUTTER: RowProps['gutter'] = [0, 40]
const RADIO_GROUP_STYLE: CSSProperties = { display: 'flex', justifyContent: 'flex-end' }

export const PropertiesContent: React.FC<PropertiesContentProps> = (props) => {
    const intl = useIntl()

    const PageTitleMessage = intl.formatMessage({ id: 'pages.condo.property.index.PageTitle' })
    const ShowMap = intl.formatMessage({ id: 'pages.condo.property.index.ViewModeMap' })
    const ShowTable = intl.formatMessage({ id: 'pages.condo.property.index.ViewModeTable' })

    const [viewMode, changeViewMode] = useState('list')
    const { isSmall } = useLayoutContext()

    const { role, searchPropertiesQuery, propertiesTableColumns, sortPropertiesBy, loading, canDownloadProperties } = props

    const handleViewModeChange = useCallback((e) => changeViewMode(e.target.value), [])

    const [properties, setShownProperties] = useState<(PropertyType)[]>([])

    return (
        <>
            <Head>
                <title>{PageTitleMessage}</title>
            </Head>
            <PageWrapper>
                <TablePageContent>
                    <Row gutter={PAGE_ROW_GUTTER} align='top' justify='space-between'>
                        <Col lg={12} xs={24}>
                            <Typography.Title>
                                {PageTitleMessage}
                            </Typography.Title>
                        </Col>
                        <Col lg={8} offset={isSmall ? 0 : 4} xs={24}>
                            <Radio.Group
                                className='sberRadioGroup'
                                style={RADIO_GROUP_STYLE}
                                value={viewMode}
                                buttonStyle='outline'
                                onChange={handleViewModeChange}
                            >
                                <Radio.Button value='list'>{ShowTable}</Radio.Button>
                                <Radio.Button value='map'>{ShowMap}</Radio.Button>
                            </Radio.Group>
                        </Col>
                        {
                            viewMode !== 'map' && (
                                <Col span={24}>
                                    <BuildingsTable
                                        role={role}
                                        searchPropertiesQuery={searchPropertiesQuery}
                                        tableColumns={propertiesTableColumns}
                                        sortBy={sortPropertiesBy}
                                        onSearch={(properties) => setShownProperties(properties)}
                                        loading={loading}
                                        canDownloadProperties={canDownloadProperties}
                                    />
                                </Col>
                            )
                        }
                    </Row>
                    {viewMode === 'map' && <PropertiesMap properties={properties} />}
                </TablePageContent>
            </PageWrapper>
        </>
    )
}

type PropertiesPageProps = {
    tab?: PropertiesType
}

export default function PropertiesPage (props: PropertiesPageProps) {
    const { link: { role = {} }, organization } = useOrganization()

    const router = useRouter()
    const { filters, sorters } = parseQuery(router.query)

    const propertyFilterMetas = usePropertyTableFilters()
    const propertiesTableColumns = usePropertiesTableColumns(propertyFilterMetas)

    const {
        filtersToWhere: filtersToPropertiesWhere,
        sortersToSortBy: sortersToSortPropertiesBy,
    } = useQueryMappers<PropertyWhereInput>(propertyFilterMetas, ['address'])

    const searchPropertiesQuery = {
        ...filtersToPropertiesWhere(filters),
        organization: { id: organization.id, deletedAt: null },
        deletedAt: null,
    }

    return (
        <PropertiesContent
            searchPropertiesQuery={searchPropertiesQuery}
            propertiesTableColumns={propertiesTableColumns}
            sortPropertiesBy={sortersToSortPropertiesBy(sorters) as SortPropertiesBy[]}
            role={role}
        />
    )
}

PropertiesPage.requiredAccess = OrganizationRequired
