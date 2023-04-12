/**
 * Generated by `createschema news.NewsItemTemplate 'organization?:Relationship:Organization:CASCADE; title:Text; body:Text;'`
 */

import {
    NewsItemTemplate,
    NewsItemTemplateCreateInput,
    NewsItemTemplateUpdateInput,
    QueryAllNewsItemTemplatesArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { NewsItemTemplate as NewsItemTemplateGQL } from '@condo/domains/news/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<NewsItemTemplate, NewsItemTemplateCreateInput, NewsItemTemplateUpdateInput, QueryAllNewsItemTemplatesArgs>(NewsItemTemplateGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}