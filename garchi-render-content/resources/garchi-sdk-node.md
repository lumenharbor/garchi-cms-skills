# GarchiCMS Node SDK (API wrapper)

This document provides details about Garchi CMS Node sdk and its example usage for managing data items, categories, spaces, reviews, reactions, page content, and many more. 
The SDK is a thin wrapper over the REST API [documented here](https://garchi.co.uk/docs/v2.openapi)



## Runtime and environment

- Target runtime: Node.js (ESM).
- Package name: @garchicms/garchi-node-sdk.
- Auth: API key via constructor or environment variable.

## Installation
Install the SDK using npm or yarn:

```bash
npm install @garchicms/garchi-node-sdk
```

## Initialization

Always initialize the SDK once and reuse it.

```ts
import GarchiCMS from "@garchicms/garchi-node-sdk";

const garchi = new GarchiCMS({
  api_key: process.env.GARCHI_API_KEY,
});
```

# Definitions

## Category Utility
```typescript
import { CreateCategoryParams, DeleteCategoryParams, GarchiCategory, UpdateCategoryParams } from "../../types";

⋮----
class Category extends APIClient
⋮----
async create(params: CreateCategoryParams) : Promise<GarchiCategory>
⋮----
async delete(params: DeleteCategoryParams) : Promise<string>
⋮----
async update(params: UpdateCategoryParams) : Promise<string>
⋮----
async getAll() : Promise<GarchiCategory[]>
```

## CompoundQuery Utility. 

This is useful for data items retrieval using compound query.

```typescript
import { CompoundQueryBody, GarchiCategoryAPIResponse, GarchiItemAPIResponse, GarchiReview, ItemsQueryParams, PaginatedResponse } from "../../types";

⋮----
class CompoundQuery extends APIClient
⋮----
async query(body: CompoundQueryBody, params: ItemsQueryParams) : Promise<GarchiItemAPIResponse | GarchiCategoryAPIResponse | 
    PaginatedResponse<GarchiReview>>
    {
        try {
            const response = await this.client.post(`/compound_query`, body, {
                params
            });
```

## Data items Utility
```typescript
import { CreateDataItemParams, CreateMetaInfoParams, DeleteDataItemParams, DeleteMetaInfoParams, FilterItemsByMetaParams, FilterItemsParams, GarchiItem, GarchiItemAPIResponse, GarchiItemMeta, GetAllItemsParams, GetFeaturedItemsParams, GetItemParams, GetItemsByIdsParams, GetItemsBySpaceParams, SemanticSearchParams, UpdateDataItemParams, UpdateMetaInfoParams } from "../../types";

⋮----
class DataItem extends APIClient
⋮----
async create(params: CreateDataItemParams): Promise<GarchiItem>
⋮----
async delete(params: DeleteDataItemParams): Promise<string>
⋮----
async update(params: UpdateDataItemParams): Promise<string>
⋮----
async createMetaInfo(params: CreateMetaInfoParams): Promise<GarchiItemMeta[]>
⋮----
async deleteMetaInfo(params: DeleteMetaInfoParams): Promise<string>
⋮----
async updateMetaInfo(params: UpdateMetaInfoParams): Promise<string>
⋮----
async getBySpace(params: GetItemsBySpaceParams): Promise<GarchiItemAPIResponse>
⋮----
async semanticSearch(params: SemanticSearchParams): Promise<GarchiItem[]>
⋮----
async featured(params: GetFeaturedItemsParams) : Promise<GarchiItemAPIResponse>
⋮----
async get(params: GetItemParams): Promise<GarchiItem>
⋮----
async getAll(params: GetAllItemsParams): Promise<GarchiItemAPIResponse>
⋮----
async filter(params: FilterItemsParams) : Promise<GarchiItem[]>
⋮----
async filterByMeta(params: FilterItemsByMetaParams) : Promise<GarchiItem[]>
⋮----
async getByIds(params: GetItemsByIdsParams) : Promise<GarchiItemAPIResponse>
```

## Headless Utility
```typescript
import { BlankSectionRequest, BlankSectionResponse, CreateOrUpdateSectionTemplateParams, CreatePageRequest, CreatePageResponse, GarchiAsset, GarchiPage, GetPageParams } from "../../types";

⋮----
class Headless extends APIClient
⋮----
async getAsset(file_name: string, space_uid: string) : Promise<GarchiAsset>
⋮----
async getPage(params: GetPageParams) : Promise<GarchiPage>
⋮----
async createOrUpdateSectionTemplates(params: CreateOrUpdateSectionTemplateParams) : Promise<string>
⋮----
async addPage(params: CreatePageRequest) : Promise<CreatePageResponse>
    {
        try {
            const response = await this.client.post(`/space/${params.space_uid}/create_page`, {
                title: params.title,
                path: params.path,
                description: params.description,
            })
            return response.data as CreatePageResponse;
        }
catch (error: any)
⋮----
async addBlankSectionToPage(params: BlankSectionRequest) : Promise<BlankSectionResponse>
    {
        try {
            const response = await this.client.post('/page/add_blank_section', {
                section_template_id: params.section_template_id,
                parent_id: params.parent_id,
                page_id: params.page_id,
            })
            return response.data as BlankSectionResponse;
        }
catch (error: any)
```

## Reaction Utility
This is useful for managing reaction for data items. For instance like/dislike for article, like for product.

```typescript
import { GarchiReaction, GarchiReactionCreate } from "../../types";

⋮----
class Reaction extends APIClient
⋮----
async manage(params: GarchiReactionCreate) : Promise<GarchiReaction>
```

## Review Utility

This is useful for managing review, reply or comment for data items. For instance review for product. Comment on an article

```typescript
import { GarchiReview, GarchiReviewCreate, PaginateQueryParams, GarchiReviewUpdate, PaginatedResponse } from "../../types";

⋮----
class Review extends APIClient
⋮----
async create(params: GarchiReviewCreate): Promise<GarchiReview>
⋮----
async update(params: GarchiReviewUpdate): Promise<string>
⋮----
async delete(review_id: number): Promise<string>
⋮----
async getByItem(item_id: number | string, queryParams: PaginateQueryParams) : Promise<PaginatedResponse<GarchiReview>>
```

## Space Utility
```typescript
import { CreatePageResponse, GarchiCategory, GarchiSpace, GarchiSpaceAPIResponse, GarchiSpaceCreate, PaginatedResponse, PaginateQueryParams, SectionTemplate } from "../../types";

⋮----
class Space extends APIClient
⋮----
async categories(space_uid: string) : Promise<GarchiCategory[]>
⋮----
async getAll(params: PaginateQueryParams) : Promise<GarchiSpaceAPIResponse>
⋮----
async get(space_uid: string) : Promise<GarchiSpace>
⋮----
async create(params: GarchiSpaceCreate): Promise<GarchiSpace>
⋮----
async update(space_uid: string, params: {
        name?: string,
        logo?: File
}) : Promise<string>
⋮----
async delete(space_uid: string) : Promise<string>
⋮----
async listPages(space_uid: string) : Promise<CreatePageResponse[]>
⋮----
async listSectionTemplates(space_uid: string) : Promise<SectionTemplate[]>
```



## Garchi Client
```typescript
import { GarchiCMSInitOptions } from "../types";
import Category from "./Category";
import CompoundQuery from "./CompoundQuery";
import DataItem from "./DataItem";
import Headless from "./Headless";
import Reaction from "./Reaction";
import Review from "./Review";
import Space from "./Space";
⋮----
class GarchiCMS
⋮----
constructor(options: GarchiCMSInitOptions)
```



## Type definitions
```typescript
export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}
⋮----
export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
}
⋮----
export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}
⋮----
export interface GetPageParams {
    space_uid: string;         // UID of the space
    slug: string;              // Slug of the page
    lang?: string;             // Optional language code (default: en-US)
    mode?: "draft" | "live";   // Optional mode of the page
}
⋮----
space_uid: string;         // UID of the space
slug: string;              // Slug of the page
lang?: string;             // Optional language code (default: en-US)
mode?: "draft" | "live";   // Optional mode of the page
⋮----
export type BlankSectionRequest = {
    page_id: string;
    section_template_id: string;
    parent_id?: string;
}
⋮----
export type BlankSectionResponse = {
    id: string;
    name: string
    description?: string
    parent_id?: string | null
    order: number
    page_id: string
    section_template_id: string

}
⋮----
export type CreatePageRequest = {
    space_uid: string;
    title: string;
    path: string;
    description: string;
}
⋮----
export type CreatePageResponse = {
    id: string;
    title: string;
    path?: string;
    slug?: string;
    description: string;
    image?: string;
    created_at?: string;
    last_updated?: string;
    updated_at?: string;
}
⋮----
export type GarchiPage = {
    id: string
    title: string
    slug: string
    description: string
    image?: string
    sections: GarchiSection[]
}
⋮----
// Property Type for Section Template
export type SectionPropType = "text" | "longtext" | "media" | "richtext" | "select" | "date" | "icon_hero" | "icon_lucid";
⋮----
// Property Interface for Section Template
export interface SectionTemplateProp {
  key: string;                        // Key of the property
  type: SectionPropType;              // Type of the property
  allowed_values?: string;            // Optional: Allowed values (required if type is 'select')
}
⋮----
key: string;                        // Key of the property
type: SectionPropType;              // Type of the property
allowed_values?: string;            // Optional: Allowed values (required if type is 'select')
⋮----
// Section Template Interface
export interface SectionTemplate {
  name: string;                       // Name of the section template
  description?: string;               // Optional: Description of the section template
  prev_name?: string;                 // Optional: Previous name (for updating existing templates)
  props?: SectionTemplateProp[];
  id?: string;     
}
⋮----
name: string;                       // Name of the section template
description?: string;               // Optional: Description of the section template
prev_name?: string;                 // Optional: Previous name (for updating existing templates)
⋮----
// API Request Body Interface
export interface CreateOrUpdateSectionTemplateParams {
  space_uid: string;                  // Unique identifier of the space
  section_templates: SectionTemplate[]; // Array of section templates to be created or updated
}
⋮----
space_uid: string;                  // Unique identifier of the space
section_templates: SectionTemplate[]; // Array of section templates to be created or updated
⋮----
export type GarchiSection = {
    id: string;
    name: string;
    description?: string;
    props: {
        [key: string]: unknown;
    };
    children: GarchiSection[];
    order: number;
}
⋮----
export type GarchiReviewCreate = {
    item_id: number;
    rating: number;
    review_body: string;
    user_email?: string;
    user_name?: string;
    parent_id?: number;
}
⋮----
export type GarchiReviewUpdate = {
    review_id: number;
    review_body?: string;
    rating: number;
}
⋮----
export type GarchiReactionCreate = {
    reaction: string;
    user_identifier: string;
    review_id?: number;
    item_id?: number;
    reaction_for: "review" | "item";
}
⋮----
export type GarchiReaction = {
    reaction_id: string;
    reaction: string;
    user_identifier: string;
    created_at: string;
    updated_at: string;
}
⋮----
export type GarchiReview = {
    review_id: number;
    review_body: string;
    rating: number;
    guest: null;
    user: {
        fname: string;
        lname: string;
    };
    item_id: number;
    reviewed_at: string;
    replies?: GarchiReview[];
    reactions?: GarchiReaction[];
}
⋮----
export type GarchiCategory = {
    id: number;
    name: string;
}
⋮----
export type GarchiAttributeOption = {
    id: number;
    name: string;
    price: number;
}
⋮----
export type GarchiAttribute = {
    id: number;
    name: string;
    min: string;
    options: GarchiAttributeOption[];
}
⋮----
export type GarchiSpace = {
    uid: string
    name: string
    logo_url?: string
    number_of_items: number
}
⋮----
export type GarchiSpaceCreate = {
    name: string
    logo?: File
}
⋮----
export type GarchiSpaceAPIResponse = PaginatedResponse<GarchiSpace>
⋮----
export type GarchiItemMeta = {
    id?: number;
    key: string;
    value: string;
    type: string;
}
⋮----
export type GarchiItem = {
    item_id: number;
    slug: string;
    sku?: string;
    name: string;
    stock?: number;
    categories: GarchiCategory[];
    price?: number;
    external_link?: string;
    scratched_price?: number | null;
    one_liner?: string;
    description?: string;
    delivery_type?: string;
    main_image?: string;
    other_images?: string[];
    attributes?: GarchiAttribute[];
    space?: GarchiSpace;
    avg_rating?: number | null;
    scheduled_for?: string | null;
    item_meta?: GarchiItemMeta[];
    reactions?: GarchiReaction[];
    created?: string;
    updated?: string;
}
⋮----
export type GarchiItemAPIResponse = PaginatedResponse<GarchiItem>
⋮----
export type GarchiCategoryAPIResponse = PaginatedResponse<GarchiCategory>
⋮----
export type GarchiAsset = {
    id: string;
    path: string;
    size: string;
    type: string;
}
⋮----
export type GarchiCMSInitOptions = {
    api_key?: string
    headers?: Record<string, string | number | boolean>;
}
⋮----
export interface CreateDataItemParams {
    space_uid: string;
    name: string;
    categories: number[];
    sku?: string;
    stock?: number;
    price?: number;
    scratched_price?: number;
    detail_description?: string;
    external_url?: string;
    slug?: string;
}
⋮----
export interface DeleteDataItemParams {
    item_id: number;
    space_uid: string;
}
⋮----
export interface UpdateDataItemParams {
    item_id: number;
    space_uid: string;
    name?: string;
    sku?: string;
    stock?: number;
    categories?: number[];
    price?: number;
    scratched_price?: number;
    detail_description?: string;
    external_url?: string;
    make_public?: boolean;
    slug?: string;
}
⋮----
export type MetaType = "string" | "array" | "url" | "object" | "numeric" | "email" | "date" | "color" | "icon_hero" | "icon_lucid";
⋮----
export interface MetaInfo {
    key: string;
    type: MetaType;
    value: string;
}
⋮----
export interface CreateMetaInfoParams {
    item_id: number;
    meta: MetaInfo[];
}
⋮----
export interface DeleteMetaInfoParams {
    meta_id: number;
    item_id: number;
    space_uid: string;
}
⋮----
export interface UpdateMetaInfoParams {
    meta_id: number;
    item_id: number;
    key?: string;
    type?: MetaType;  // Already defined as allowed values: string, array, url, object, numeric, email, date
    value?: string;
}
⋮----
type?: MetaType;  // Already defined as allowed values: string, array, url, object, numeric, email, date
⋮----
export interface PaginateQueryParams {
    size?: number;  // Number of entries per page
    page?: number;  // Page number
}
⋮----
size?: number;  // Number of entries per page
page?: number;  // Page number
⋮----
export interface ItemsQueryParams extends PaginateQueryParams {
    order_key?: "name" | "price" | "created" | `meta.${string}`;  // Allowed ordering keys
    order_by?: "asc" | "desc";  // Sort order
    reactions?: "include" | "exclude";  // Include or exclude reactions
    description?: "include" | "exclude";  // Include or exclude markdown descriptions
}
⋮----
order_key?: "name" | "price" | "created" | `meta.${string}`;  // Allowed ordering keys
order_by?: "asc" | "desc";  // Sort order
reactions?: "include" | "exclude";  // Include or exclude reactions
description?: "include" | "exclude";  // Include or exclude markdown descriptions
⋮----
export interface GetItemsBySpaceParams extends ItemsQueryParams {
    uid: string;  // Required URL parameter for space UID
}
⋮----
uid: string;  // Required URL parameter for space UID
⋮----
export interface SemanticSearchParams {
    q: string;  // Required search query
    threshold?: number;  // Optional threshold between 0-1 (default 0.5)
    reactions?: "include" | "exclude";  // Include or exclude reactions
    description?: "include" | "exclude";  // Include or exclude markdown description
}
⋮----
q: string;  // Required search query
threshold?: number;  // Optional threshold between 0-1 (default 0.5)
reactions?: "include" | "exclude";  // Include or exclude reactions
description?: "include" | "exclude";  // Include or exclude markdown description
⋮----
export interface GetFeaturedItemsParams {
    reactions?: "include" | "exclude";  // Include or exclude reactions
    description?: "include" | "exclude";  // Include or exclude markdown description
}
⋮----
reactions?: "include" | "exclude";  // Include or exclude reactions
description?: "include" | "exclude";  // Include or exclude markdown description
⋮----
export interface GetItemParams {
    item: string | number;  // Required: ID or slug of the item
    reactions?: "include" | "exclude";  // Optional: Include or exclude reactions
}
⋮----
item: string | number;  // Required: ID or slug of the item
reactions?: "include" | "exclude";  // Optional: Include or exclude reactions
⋮----
export interface GetAllItemsParams extends ItemsQueryParams {
    search_keyword?: string;  // Optional: Name, slug, or category name
}
⋮----
search_keyword?: string;  // Optional: Name, slug, or category name
⋮----
export interface FilterItemsBodyParams {
    spaces?: string[];  // Optional: Array of space UIDs
    categories?: number[];  // Optional: Array of category IDs
    priceOrder?: "low-high" | "high-low";  // Optional: Price sorting order
    size?: number;  // Optional: Size of the paginated data chunk
}
⋮----
spaces?: string[];  // Optional: Array of space UIDs
categories?: number[];  // Optional: Array of category IDs
priceOrder?: "low-high" | "high-low";  // Optional: Price sorting order
size?: number;  // Optional: Size of the paginated data chunk
⋮----
export interface FilterItemsParams {
    query?: ItemsQueryParams;  // Query parameters for ordering and reactions
    body: FilterItemsBodyParams;  // Body parameters for filtering by spaces, categories, etc.
}
⋮----
query?: ItemsQueryParams;  // Query parameters for ordering and reactions
body: FilterItemsBodyParams;  // Body parameters for filtering by spaces, categories, etc.
⋮----
export type MetaFilterOperator = "equals" | "in" | "like" | "gte" | "lte";
⋮----
export interface MetaFilter {
    key: string;  // Required: Meta key to filter by
    value: string | number | (string | number)[];  // Required: Value(s) to match
    operator: MetaFilterOperator;  // Required: Operator for matching
}
⋮----
key: string;  // Required: Meta key to filter by
value: string | number | (string | number)[];  // Required: Value(s) to match
operator: MetaFilterOperator;  // Required: Operator for matching
⋮----
export interface FilterItemsByMetaBodyParams {
    meta_filters: MetaFilter[];  // Required: Array of meta filters
}
⋮----
meta_filters: MetaFilter[];  // Required: Array of meta filters
⋮----
export interface FilterItemsByMetaParams {
    query?: ItemsQueryParams;  // Optional query parameters
    body: FilterItemsByMetaBodyParams;  // Required body parameters
}
⋮----
query?: ItemsQueryParams;  // Optional query parameters
body: FilterItemsByMetaBodyParams;  // Required body parameters
⋮----
export interface GetItemsByIdsBodyParams {
    item_ids: (number | string)[];  // Required: List of item IDs to fetch
}
⋮----
item_ids: (number | string)[];  // Required: List of item IDs to fetch
⋮----
export interface GetItemsByIdsParams {
    query?: ItemsQueryParams;  // Optional query parameters
    body: GetItemsByIdsBodyParams;  // Required body parameters
}
⋮----
query?: ItemsQueryParams;  // Optional query parameters
body: GetItemsByIdsBodyParams;  // Required body parameters
⋮----
export interface CreateCategoryParams {
    category: string
    space_uid: string
}
⋮----
export interface DeleteCategoryParams {
    category_id: number
    space_uid: string
}
⋮----
export interface UpdateCategoryParams extends CreateCategoryParams {
    category_id: number
}
⋮----
// Allowed datasets
export type DatasetType = "items" | "categories" | "reviews";
⋮----
// Allowed fields for each dataset
export type ItemFields = "item_id" | "name" | "slug" | "description" | "categories" | "ratings" | "price" | "created";
export type CategoryFields = "category_id" | "category_name";
export type ReviewFields = "review_id" | "item_id" | "rating" | "review" | "created";
⋮----
// Allowed conditions
export type ConditionType = "eq" | "gte" | "lte" | "gt" | "lt" | "like" | "in" | "not_eq" | "not_in";
⋮----
// Logic operators for conditions
export type LogicType = "and" | "or";
⋮----
export interface CompoundQueryBody {
    dataset: DatasetType;       // Dataset to query (items, categories, reviews)
    fields: string[];           // Fields to filter on (must match allowed fields for the dataset)
    conditions: ConditionType[];// Conditions applied on fields (eq, gte, like, etc.)
    values: (string | number)[];// Values to match against the fields
    logic?: LogicType[];        // Logical operators to combine conditions (and/or)
}
⋮----
dataset: DatasetType;       // Dataset to query (items, categories, reviews)
fields: string[];           // Fields to filter on (must match allowed fields for the dataset)
conditions: ConditionType[];// Conditions applied on fields (eq, gte, like, etc.)
values: (string | number)[];// Values to match against the fields
logic?: LogicType[];        // Logical operators to combine conditions (and/or)
```



