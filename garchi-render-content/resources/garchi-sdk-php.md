
# Garchi CMS PHP SDK 

This document provides details about Garchi CMS PHP sdk and its example usage for managing data items, categories, spaces, reviews, reactions, page content, and many more. 
The SDK is a thin wrapper over the REST API [documented here](https://garchi.co.uk/docs/v2.openapi)

## Installation
Install the SDK using composer:

```bash
composer require garchicms/garchi-php-sdk
```


# Definitions

## Contracts
```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents a GarchiCMS Asset.
 */
class GarchiAsset {
public string $id;
public string $path;
public string $size;
public string $type;
⋮----
/**
     * GarchiAsset constructor.
     *
     * @param array $data API response data.
     */
public function __construct(array $data) {
```

```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents an Attribute of a GarchiCMS Item.
 */
class GarchiAttribute {
public string $key;
public string $value;
public ?string $type;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents a category in GarchiCMS.
 */
class GarchiCategory {
public int $category_id;
public string $name;
public ?string $description;
⋮----
/**
     * GarchiCategory constructor.
     *
     * @param array $data
     */
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
use GarchiCMS\Contracts\GarchiCategory;
use GarchiCMS\Contracts\GarchiItemMeta;
use GarchiCMS\Contracts\GarchiAttribute;
use GarchiCMS\Contracts\GarchiSpace;
use GarchiCMS\Contracts\GarchiReaction;
⋮----
/**
 * Represents a GarchiCMS Item.
 */
class GarchiItem {
public int $item_id;
public string $slug;
public ?string $sku;
public string $name;
public ?int $stock;
/** @var GarchiCategory[] */
public array $categories;
public ?float $price;
public ?string $external_link;
public ?float $scratched_price;
public ?string $one_liner;
public ?string $description;
public ?string $delivery_type;
public ?string $main_image;
/** @var string[] */
public array $other_images;
/** @var GarchiAttribute[] */
public array $attributes;
public ?GarchiSpace $space;  // GarchiSpace object
public ?float $avg_rating;
public ?string $scheduled_for;
/** @var GarchiItemMeta[] */
public array $item_meta;
/** @var GarchiReaction[] */
public array $reactions;
public ?string $created;
public ?string $updated;
⋮----
public function __construct(array $data) {
⋮----
// Convert space to GarchiSpace object if provided
```


```php
namespace GarchiCMS\Contracts;
⋮----
use GarchiCMS\Contracts\GarchiItem;
use GarchiCMS\Contracts\PaginationLinks;
use GarchiCMS\Contracts\PaginationMeta;
⋮----
/**
 * Represents a paginated response for GarchiItems.
 */
class GarchiItemAPIResponse {
/** @var GarchiItem[] */
public array $data;
public PaginationLinks $links;
public PaginationMeta $meta;
⋮----
public function __construct(array $response) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents metadata for a GarchiCMS item.
 */
class GarchiItemMeta {
public ?int $id;
public string $key;
public string $value;
public string $type;
⋮----
/**
     * GarchiItemMeta constructor.
     *
     * @param array $data
     */
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
use GarchiCMS\Contracts\GarchiSection;
⋮----
/**
 * Represents a GarchiCMS page.
 */
class GarchiPage {
public string $id;
public string $title;
public string $slug;
public string $description;
public string $image;
/** @var GarchiSection[] */
public array $sections;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents a Reaction to a GarchiCMS Item.
 */
class GarchiReaction {
public string $reaction_id;
public string $reaction;
public string $user_identifier;
public string $created_at;
public string $updated_at;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents a Review in GarchiCMS.
 */
class GarchiReview {
public int $review_id;
public string $review_body;
public int $rating;
public ?array $guest; // Keeping null structure as given in TypeScript
public array $user;
public int $item_id;
public string $reviewed_at;
/** @var GarchiReview[]|null */
public ?array $replies;
/** @var GarchiReaction[]|null */
public ?array $reactions;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
/**
 * Represents a section in a GarchiCMS page.
 */
⋮----
class GarchiSection {
public string $id;
public string $name;
public ?string $description;
public array $props; // Associative array of properties
/** @var GarchiSection[] */
public array $children;
public int $order;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents a Space in GarchiCMS.
 */
class GarchiSpace {
public string $uid;
public string $name;
public ?string $logo_url;
public ?int $number_of_items;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
use GarchiCMS\Contracts\PaginationLinks;
use GarchiCMS\Contracts\PaginationMeta;
⋮----
/**
 * Represents a paginated response.
 *
 * @template T
 */
class PaginatedResponse {
/** @var array<T> */
public array $data;
public PaginationLinks $links;
public PaginationMeta $meta;
⋮----
/**
     * PaginatedResponse constructor.
     * 
     * @param array $response API response data.
     * @param string $itemClass The class name of the item type (e.g., GarchiItem).
     */
public function __construct(array $response, string $itemClass) {
$this->data = array_map(fn($item) => new $itemClass($item), $response['data'] ?? []);
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents pagination link structure.
 */
class PaginationLinks {
public string $first;
public string $last;
public ?string $prev;
public ?string $next;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents pagination metadata.
 */
class PaginationMeta {
public int $current_page;
public int $from;
public int $last_page;
public array $links;
public string $path;
public int $per_page;
public int $to;
public int $total;
⋮----
public function __construct(array $data) {
```


```php
namespace GarchiCMS\Contracts;
⋮----
/**
 * Represents section property types.
 */
class SectionPropType {
```

## Category Utility
```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiCategory;
⋮----
/**
 * Wrapper for Category API endpoints.
 */
class Category {
protected APIClient $client;
⋮----
public function __construct(APIClient $client) {
⋮----
/**
     * Create a new category.
     *
     * @param array $params Category creation parameters.
     * @return GarchiCategory
     */
public function create(array $params): GarchiCategory {
$response = $this->client->request('POST', "/category", ['json' => $params]);
⋮----
/**
     * Delete a category.
     *
     * @param array $params Deletion parameters (requires space_uid and category_id).
     * @return string
     */
public function delete(array $params): string {
⋮----
$response = $this->client->request('POST', $endpoint);
⋮----
/**
     * Update a category.
     *
     * @param array $params Update parameters (requires category_id, space_uid, and category data).
     * @return string
     */
public function update(array $params): string {
⋮----
$response = $this->client->request('POST', $endpoint, ['json' => [
⋮----
/**
     * Get all categories.
     *
     * @return GarchiCategory[]
     */
public function getAll(): array {
$response = $this->client->request('GET', "/categories");
```

## Compound Query Utility

This is useful for data items retrieval using compound query.

```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiCategory;
use GarchiCMS\Contracts\PaginatedResponse;
use GarchiCMS\Contracts\GarchiReview;
use GarchiCMS\Contracts\GarchiItemAPIResponse;
⋮----
/**
 * Wrapper for Compound Query API endpoints.
 */
class CompoundQuery {
protected APIClient $client;
⋮----
public function __construct(APIClient $client) {
⋮----
/**
     * Perform a compound query on items, categories, or reviews.
     *
     * @param array $body Query body parameters.
     * @param array $params Query parameters.
     * @return GarchiItemAPIResponse|PaginatedResponse<GarchiReview | GarchiCategory>   
     * @throws \Exception
     */
public function query(array $body, array $params): GarchiItemAPIResponse|PaginatedResponse {
$response = $this->client->request('POST', "/compound_query", [
⋮----
throw new \Exception("API Error: " . $response['error']);
⋮----
// Determine the response type dynamically
⋮----
default => throw new \Exception("Invalid API Response: Could not determine response type.")
```

## Data item Utility
```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiItem;
use GarchiCMS\Contracts\GarchiItemMeta;
use GarchiCMS\Contracts\GarchiItemAPIResponse;
⋮----
class DataItem {
protected APIClient $client;
⋮----
public function __construct(APIClient $client) {
⋮----
public function create(array $params): GarchiItem {
$response = $this->client->request('POST', "/item", ['json' => $params]);
⋮----
public function delete(array $params): string {
$response = $this->client->request('POST', "/delete/item", ['json' => $params]);
⋮----
public function update(array $params): string {
$response = $this->client->request('POST', "/update/item", ['json' => $params]);
⋮----
public function createMetaInfo(array $params): array {
$response = $this->client->request('POST', "/item_meta", ['json' => $params]);
⋮----
public function deleteMetaInfo(array $params): string {
$response = $this->client->request('POST', "/delete/item_meta", ['json' => $params]);
⋮----
public function updateMetaInfo(array $params): string {
$response = $this->client->request('POST', "/update/item_meta", ['json' => $params]);
⋮----
public function getBySpace(array $params): GarchiItemAPIResponse {
$response = $this->client->request('GET', "/space/{$params['uid']}/items", ['query' => $params]);
⋮----
public function semanticSearch(array $params): array {
$response = $this->client->request('GET', "/items/semantic-search", ['query' => $params]);
⋮----
public function featured(array $params): GarchiItemAPIResponse {
$response = $this->client->request('GET', "/items/featured", ['query' => $params]);
⋮----
public function get(array $params): GarchiItem {
$response = $this->client->request('GET', "/item/{$params['item']}", ['query' => $params]);
⋮----
public function getAll(array $params): GarchiItemAPIResponse {
$response = $this->client->request('GET', "/items", ['query' => $params]);
⋮----
public function filter(array $params): array {
$response = $this->client->request('POST', "/items/filter", [
⋮----
public function filterByMeta(array $params): array {
$response = $this->client->request('POST', "/items/filter/bymeta", [
⋮----
public function getByIds(array $params): GarchiItemAPIResponse {
$response = $this->client->request('POST', "/items/byids", [
```

## Headless Utility
```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiAsset;
use GarchiCMS\Contracts\GarchiPage;
⋮----
/**
 * Wrapper for Headless API endpoints.
 */
class Headless {
protected APIClient $client;
⋮----
public function __construct(APIClient $client) {
⋮----
/**
     * Get an asset from a space.
     *
     * @param string $file_name The name of the file.
     * @param string $space_uid The UID of the space.
     * @return GarchiAsset
     * @throws \Exception
     */
public function getAsset(string $file_name, string $space_uid): GarchiAsset {
$response = $this->client->request('GET', "/space/assets/{$file_name}", [
⋮----
throw new \Exception("API Error: " . $response['error']);
⋮----
/**
     * Get a page from the headless CMS.
     *
     * @param array $params GetPageParams.
     * @return GarchiPage
     * @throws \Exception
     */
public function getPage(array $params): GarchiPage {
$response = $this->client->request('POST', "/page", ['json' => $params]);
⋮----
/**
     * Create or update section templates.
     *
     * @param array $params CreateOrUpdateSectionTemplateParams.
     * @return string
     * @throws \Exception
     */
public function createOrUpdateSectionTemplates(array $params): string {
$response = $this->client->request('POST', "/section_template", ['json' => $params]);
⋮----
/**
     * Add a page to a space.
     *
     * @param array $params ['space_uid' => string, 'title' => string, 'path' => string, 'description' => string]
     * @return array
     * @throws \Exception
     */
public function addPage(array $params): array {
⋮----
$response = $this->client->request('POST', "/space/{$params['space_uid']}/create_page", [
⋮----
throw new \Exception($response['error']);
⋮----
/**
     * Add a blank section to a page.
     *
     * @param array $params ['page_id' => string, 'section_template_id' => string, 'parent_id' => string|null]
     * @return array
     * @throws \Exception
     */
public function addBlankSectionToPage(array $params): array {
⋮----
$response = $this->client->request('POST', "/page/add_blank_section", [
```

## Reaction Utility
```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiReaction;
⋮----
/**
 * Wrapper for Reaction API endpoints.
 */
class Reaction

This is useful for managing reaction for data items. For instance like/dislike for article, like for product.

⋮----
protected APIClient $client;
⋮----
public function __construct(APIClient $client)
⋮----
/**
     * Manage reactions for an item.
     *
     * @param array $params Reaction creation parameters.
     * @return GarchiReaction
     */
public function manage(array $params): GarchiReaction | string
⋮----
$response = $this->client->request('POST', "/manage-reaction", ['json' => $params]);
⋮----
throw new \Exception("API Error: " . $response['error']);
```

## Review Utility

This is useful for managing review, reply or comment for data items. For instance review for product. Comment on an article.

```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiReview;
use GarchiCMS\Contracts\PaginatedResponse;
⋮----
/**
 * Wrapper for Review API endpoints.
 */
class Review {
protected APIClient $client;
⋮----
public function __construct(APIClient $client) {
⋮----
/**
     * Create a new review.
     *
     * @param array $params Review creation parameters.
     * @return GarchiReview
     */
public function create(array $params): GarchiReview {
$response = $this->client->request('POST', "/reviews/item", ['json' => $params]);
⋮----
throw new \Exception("API Error: " . $response['error']);
⋮----
/**
     * Update an existing review.
     *
     * @param array $params Review update parameters.
     * @return string
     */
public function update(array $params): string {
$response = $this->client->request('POST', "/reviews/edit", ['json' => $params]);
⋮----
/**
     * Delete a review.
     *
     * @param int $review_id Review ID to delete.
     * @return string
     */
public function delete(int | string $review_id): string {
$response = $this->client->request('POST', "/reviews/delete", [
⋮----
/**
     * Get reviews for an item with pagination.
     *
     * @param int|string $item_id The ID of the item.
     * @param array $queryParams Pagination parameters.
     * @return PaginatedResponse<GarchiReview>
     */
public function getByItem(int|string $item_id, array $queryParams): PaginatedResponse {
$response = $this->client->request('GET', "/reviews/item/{$item_id}", ['query' => $queryParams]);
```

## Space utility
```php
namespace GarchiCMS\Wrappers;
⋮----
use GarchiCMS\APIClient;
use GarchiCMS\Contracts\GarchiCategory;
use GarchiCMS\Contracts\GarchiPage;
use GarchiCMS\Contracts\GarchiSpace;
use GarchiCMS\Contracts\PaginatedResponse;
use GuzzleHttp\Psr7\MultipartStream;
⋮----
/**
 * Wrapper for Space API endpoints.
 */
class Space {
protected APIClient $client;
⋮----
public function __construct(APIClient $client) {
⋮----
/**
     * Get categories of a space.
     *
     * @param string $space_uid
     * @return GarchiCategory[]
     */
public function categories(string $space_uid): array {
$response = $this->client->request('GET', "/space/{$space_uid}/categories");
⋮----
throw new \Exception("API Error: " . $response['error']);
⋮----
/**
     * Get all spaces with pagination.
     *
     * @param array $params PaginateQueryParams
     * @return PaginatedResponse<GarchiSpace>
     */
public function getAll(array $params): PaginatedResponse {
$response = $this->client->request('GET', "/spaces", ['query' => $params]);
⋮----
/**
     * Get a specific space by UID.
     *
     * @param string $space_uid
     * @return GarchiSpace
     */
public function get(string $space_uid): GarchiSpace {
$response = $this->client->request('GET', "/space/{$space_uid}");
⋮----
/**
     * Create a new space.
     *
     * @param array $params ['name' => string, 'logo' => string (file path)]
     * @return GarchiSpace
     */
public function create(array $params): GarchiSpace {
⋮----
$response = $this->client->request('POST', "/space", ['multipart' => $multipart]);
⋮----
/**
     * Update an existing space.
     *
     * @param string $space_uid
     * @param array $params ['name' => string, 'logo' => string (file path)]
     * @return string
     */
public function update(string $space_uid, array $params): string {
⋮----
$response = $this->client->request('POST', "/update/space/{$space_uid}", ['multipart' => $multipart]);
⋮----
/**
     * Delete a space.
     *
     * @param string $space_uid
     * @return string
     */
public function delete(string $space_uid): string {
$response = $this->client->request('DELETE', "/delete/space/{$space_uid}");
⋮----
/**
     * List pages of a space.
     *
     * @param string $space_uid
     * @return GarchiPage[]
     */
public function listPages(string $space_uid): array {
$response = $this->client->request('GET', "/space/{$space_uid}/pages");
⋮----
/**
     * List section templates of a space.
     *
     * @param string $space_uid
     * @return array
     */
public function listSectionTemplates(string $space_uid): array {
$response = $this->client->request('GET', "/space/{$space_uid}/section_templates");
```



## Garchi Client
```php
namespace GarchiCMS;
⋮----
use GarchiCMS\Wrappers\DataItem;
use GarchiCMS\Wrappers\Category;
use GarchiCMS\Wrappers\Space;
use GarchiCMS\Wrappers\Review;
use GarchiCMS\Wrappers\Reaction;
use GarchiCMS\Wrappers\CompoundQuery;
use GarchiCMS\Wrappers\Headless;
⋮----
class GarchiCMS {
public $dataItem;
public $category;
public $space;
public $review;
public $reaction;
public $compoundQuery;
public $headless;
⋮----
public function __construct(string $apiKey, array $headers = []) {
```
