
# Garchi CMS PHP SDK 

This document provides details about Garchi CMS PHP sdk and its example usage for managing data items, categories, spaces, reviews, reactions, page content, and many more. 
The SDK is a thin wrapper over the REST API documented at https://garchi.co.uk/docs/v2.openapi

## Installation
Install the SDK using composer:

```bash
composer require garchicms/garchi-php-sdk
```


## Quick start

```php
use GarchiCMS\GarchiCMS;

$garchi = new GarchiCMS("YOUR_API_KEY");
```

You can pass custom headers when creating the client:

```php
$garchi = new GarchiCMS("YOUR_API_KEY", [
    "X-Client" => "my-app",
]);
```

## Core entry points

- `GarchiCMS` creates and exposes wrapper modules: `dataItem`, `category`, `space`, `review`, `reaction`, `compoundQuery`, `headless`.
- `APIClient` performs HTTP requests and JSON decoding.

### APIClient

```php
use GarchiCMS\APIClient;

$client = new APIClient("YOUR_API_KEY");
$response = $client->request("GET", "/spaces", ["query" => ["page" => 1]]);
```

Notes:
- Base URL is `https://garchi.co.uk/api/v2`.
- On transport error, returns `['error' => '...']`.

## Wrapper methods and examples

### DataItem wrapper

Namespace: `GarchiCMS\Wrappers\DataItem`

- `create(array $params): GarchiItem`

```php
$item = $garchi->dataItem->create([
    "space_uid" => "your_space_uid",
    "name" => "New Item",
    "categories" => [1, 2],
]);
```

- `delete(array $params): string`

```php
$message = $garchi->dataItem->delete([
    "item_id" => 123,
]);
```

- `update(array $params): string`

```php
$message = $garchi->dataItem->update([
    "item_id" => 123,
    "name" => "Updated Name",
]);
```

- `createMetaInfo(array $params): GarchiItemMeta[]`

```php
$meta = $garchi->dataItem->createMetaInfo([
    "item_id" => 123,
    "meta" => [
        ["key" => "color", "value" => "black", "type" => "string"],
    ],
]);
```

- `deleteMetaInfo(array $params): string`

```php
$message = $garchi->dataItem->deleteMetaInfo([
    "item_id" => 123,
    "meta_id" => 456,
]);
```

- `updateMetaInfo(array $params): string`

```php
$message = $garchi->dataItem->updateMetaInfo([
    "item_id" => 123,
    "meta_id" => 456,
    "key" => "color",
    "value" => "blue",
]);
```

- `getBySpace(array $params): GarchiItemAPIResponse`

```php
$response = $garchi->dataItem->getBySpace([
    "uid" => "your_space_uid",
    "page" => 1,
    "size" => 10,
]);
```

- `semanticSearch(array $params): GarchiItem[]`

```php
$items = $garchi->dataItem->semanticSearch([
    "space_uid" => "your_space_uid",
    "q" => "wireless earbuds",
]);
```

- `featured(array $params): GarchiItemAPIResponse`

```php
$featured = $garchi->dataItem->featured([
    "space_uid" => "your_space_uid",
]);
```

- `get(array $params): GarchiItem`

```php
$item = $garchi->dataItem->get([
    "item" => 123,
]);
```

- `getAll(array $params): GarchiItemAPIResponse`

```php
$items = $garchi->dataItem->getAll([
    "page" => 1,
    "size" => 20,
]);
```

- `filter(array $params): GarchiItem[]`

```php
$items = $garchi->dataItem->filter([
    "body" => ["filters" => [["key" => "price", "op" => "lte", "value" => 100]]],
    "query" => ["space_uid" => "your_space_uid"],
]);
```

- `filterByMeta(array $params): GarchiItem[]`

```php
$items = $garchi->dataItem->filterByMeta([
    "body" => ["filters" => [["key" => "color", "value" => "black"]]],
    "query" => ["space_uid" => "your_space_uid"],
]);
```

- `getByIds(array $params): GarchiItemAPIResponse`

```php
$items = $garchi->dataItem->getByIds([
    "body" => ["ids" => [1, 2, 3]],
    "query" => ["space_uid" => "your_space_uid"],
]);
```

### Category wrapper

Namespace: `GarchiCMS\Wrappers\Category`

- `create(array $params): GarchiCategory`

```php
$category = $garchi->category->create([
    "space_uid" => "your_space_uid",
    "category" => "Accessories",
]);
```

- `delete(array $params): string`

```php
$message = $garchi->category->delete([
    "space_uid" => "your_space_uid",
    "category_id" => 10,
]);
```

- `update(array $params): string`

```php
$message = $garchi->category->update([
    "space_uid" => "your_space_uid",
    "category_id" => 10,
    "category" => "Updated Category",
]);
```

- `getAll(): GarchiCategory[]`

```php
$categories = $garchi->category->getAll();
```

### Space wrapper

Namespace: `GarchiCMS\Wrappers\Space`

- `categories(string $space_uid): GarchiCategory[]`

```php
$categories = $garchi->space->categories("your_space_uid");
```

- `getAll(array $params): PaginatedResponse<GarchiSpace>`

```php
$spaces = $garchi->space->getAll([
    "page" => 1,
    "size" => 10,
]);
```

- `get(string $space_uid): GarchiSpace`

```php
$space = $garchi->space->get("your_space_uid");
```

- `create(array $params): GarchiSpace`

```php
$space = $garchi->space->create([
    "name" => "New Space",
    "logo" => "/path/to/logo.png",
]);
```

- `update(string $space_uid, array $params): string`

```php
$message = $garchi->space->update("your_space_uid", [
    "name" => "Renamed Space",
    "logo" => "/path/to/new-logo.png",
]);
```

- `delete(string $space_uid): string`

```php
$message = $garchi->space->delete("your_space_uid");
```

- `listPages(string $space_uid): GarchiPage[]`

```php
$pages = $garchi->space->listPages("your_space_uid");
```

- `listSectionTemplates(string $space_uid): array`

```php
$templates = $garchi->space->listSectionTemplates("your_space_uid");
```

### Review wrapper

Namespace: `GarchiCMS\Wrappers\Review`

- `create(array $params): GarchiReview`

```php
$review = $garchi->review->create([
    "item_id" => 123,
    "rating" => 5,
    "review_body" => "Excellent product!",
    "user_email" => "user@example.com",
    "user_name" => "Jane Doe",
]);
```

- `update(array $params): string`

```php
$message = $garchi->review->update([
    "review_id" => 1,
    "review_body" => "Updated review",
    "rating" => 4,
]);
```

- `delete(int|string $review_id): string`

```php
$message = $garchi->review->delete(1);
```

- `getByItem(int|string $item_id, array $queryParams): PaginatedResponse<GarchiReview>`

```php
$reviews = $garchi->review->getByItem(123, [
    "page" => 1,
    "size" => 10,
]);
```

### Reaction wrapper

Namespace: `GarchiCMS\Wrappers\Reaction`

- `manage(array $params): GarchiReaction|string`

```php
$result = $garchi->reaction->manage([
    "reaction" => "like",
    "user_identifier" => "user@example.com",
    "review_id" => 1,
    "item_id" => 1,
    "reaction_for" => "review",
]);
```

### CompoundQuery wrapper

Namespace: `GarchiCMS\Wrappers\CompoundQuery`

- `query(array $body, array $params): GarchiItemAPIResponse|PaginatedResponse`

```php
$result = $garchi->compoundQuery->query([
    "dataset" => "items",
    "fields" => ["name", "price"],
    "conditions" => ["like", "gte"],
    "values" => ["%item%", "10"],
    "logic" => ["and"],
], [
    "order_key" => "name",
    "order_by" => "asc",
]);
```

Notes:
- `dataset` controls the response type: `items` returns `GarchiItemAPIResponse`, `categories` and `reviews` return `PaginatedResponse`.
- The current implementation prints the raw response (`print_r`), so avoid using in strict output contexts.

### Headless wrapper

Namespace: `GarchiCMS\Wrappers\Headless`

- `getAsset(string $file_name, string $space_uid): GarchiAsset`

```php
$asset = $garchi->headless->getAsset("hero.jpg", "your_space_uid");
```

- `getPage(array $params): GarchiPage`

```php
$page = $garchi->headless->getPage([
    "space_uid" => "your_space_uid",
    "slug" => "/",
    "lang" => "en-US",
    "mode" => "live",
]);
```

- `createOrUpdateSectionTemplates(array $params): string`

```php
$message = $garchi->headless->createOrUpdateSectionTemplates([
    "space_uid" => "your_space_uid",
    "templates" => [
        [
            "name" => "HeroSection",
            "description" => "components/HeroSection",
            "props" => [
                ["key" => "title", "type" => "text"],
                ["key" => "image", "type" => "image"],
            ],
        ],
    ],
]);
```

- `addPage(array $params): array`

```php
$page = $garchi->headless->addPage([
    "space_uid" => "your_space_uid",
    "title" => "Home",
    "path" => "/",
    "description" => "Homepage",
]);
```

- `addBlankSectionToPage(array $params): array`

```php
$section = $garchi->headless->addBlankSectionToPage([
    "page_id" => "page_id",
    "section_template_id" => "template_id",
    "parent_id" => null,
]);
```

## Types and interfaces

Use these classes for typed responses and autocompletion.

### GarchiItem

```php
use GarchiCMS\Contracts\GarchiItem;

// Fields
// int $item_id
// string $slug
// ?string $sku
// string $name
// ?int $stock
// GarchiCategory[] $categories
// ?float $price
// ?string $external_link
// ?float $scratched_price
// ?string $one_liner
// ?string $description
// ?string $delivery_type
// ?string $main_image
// string[] $other_images
// GarchiAttribute[] $attributes
// ?GarchiSpace $space
// ?float $avg_rating
// ?string $scheduled_for
// GarchiItemMeta[] $item_meta
// GarchiReaction[] $reactions
// ?string $created
// ?string $updated
```

### GarchiCategory

```php
use GarchiCMS\Contracts\GarchiCategory;

// Fields
// int $category_id
// string $name
// ?string $description
```

### GarchiReview

```php
use GarchiCMS\Contracts\GarchiReview;

// Fields
// int $review_id
// string $review_body
// int $rating
// ?array $guest
// array $user
// int $item_id
// string $reviewed_at
// ?GarchiReview[] $replies
// ?GarchiReaction[] $reactions
```

### GarchiReaction

```php
use GarchiCMS\Contracts\GarchiReaction;

// Fields
// string $reaction_id
// string $reaction
// string $user_identifier
// string $created_at
// string $updated_at
```

### GarchiSpace

```php
use GarchiCMS\Contracts\GarchiSpace;

// Fields
// string $uid
// string $name
// ?string $logo_url
// ?int $number_of_items
```

### GarchiAsset

```php
use GarchiCMS\Contracts\GarchiAsset;

// Fields
// string $id
// string $path
// string $size
// string $type
```

### GarchiAttribute

```php
use GarchiCMS\Contracts\GarchiAttribute;

// Fields
// string $key
// string $value
// ?string $type
```

### GarchiItemMeta

```php
use GarchiCMS\Contracts\GarchiItemMeta;

// Fields
// ?int $id
// string $key
// string $value
// string $type
```

### GarchiPage

```php
use GarchiCMS\Contracts\GarchiPage;

// Fields
// string $id
// string $title
// string $slug
// string $description
// string $image
// GarchiSection[] $sections
```

### GarchiSection

```php
use GarchiCMS\Contracts\GarchiSection;

// Fields
// string $id
// string $name
// ?string $description
// array $props
// GarchiSection[] $children
// int $order
```

### PaginationLinks

```php
use GarchiCMS\Contracts\PaginationLinks;

// Fields
// string $first
// string $last
// ?string $prev
// ?string $next
```

### PaginationMeta

```php
use GarchiCMS\Contracts\PaginationMeta;

// Fields
// int $current_page
// int $from
// int $last_page
// array $links
// string $path
// int $per_page
// int $to
// int $total
```

### PaginatedResponse<T>

```php
use GarchiCMS\Contracts\PaginatedResponse;

// Fields
// array<T> $data
// PaginationLinks $links
// PaginationMeta $meta
```

### GarchiItemAPIResponse

```php
use GarchiCMS\Contracts\GarchiItemAPIResponse;

// Fields
// GarchiItem[] $data
// PaginationLinks $links
// PaginationMeta $meta
```

### SectionPropType

```php
use GarchiCMS\Contracts\SectionPropType;

// Constants
// SectionPropType::TEXT
// SectionPropType::IMAGE
// SectionPropType::VIDEO
```

## Error handling

- Most wrappers throw `\Exception` when `['error' => '...']` is returned by the API.
- `APIClient::request` returns an `error` key on transport failures.
- `Reaction::manage` can return a `string` `message` instead of a `GarchiReaction`.

## Edge cases and tips

- The `DataItem::get` call expects the API to return an array and uses the first element (`data[0]`).
- `CompoundQuery::query` currently prints the raw response; keep this in mind for CLI output.
- `Space::create` and `Space::update` expect file paths for `logo` and open them with `fopen`.
- For non-paginated endpoints, responses are returned directly instead of under a `data` key.
