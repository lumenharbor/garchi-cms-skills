
# Overview

Garchi CMS is a cloud based headless CMS that allows you to manage content and data for your websites and applications. 


With Garchi CMS, you can:

- Build headless websites by creating reusable page templates and populating them with content.
- Manage data items like blog posts, products, menus etc. to use dynamically across your site.
- Build fast, scalable websites with Garchi—seamlessly integrate it into your existing or new stack.
- Use the Garchi CMS APIs or SDKs to manage content and data in your apps.


Our focus is giving you a way to manage your content while giving complete freedom to choose your own frameworks, databases and services. It complements your tech stack instead of replacing it.

Some examples of using GarchiCMS (Remember sky is the limit):

- Headless site with Nuxt/Next, Supabase and Garchi CMS.
- E-commerce mobile app with React Native, Firebase, and Garchi CMS for product data.
- Full stack app with Django/Laravel/Ruby on Rails, Postgres, and Garchi CMS for content.


Garchi CMS is not restricted to headless web pages. With [data items](https://garchi.co.uk/documentation/1.0/data-items/data-items), you can define products, blog posts, events or virtually any other data you can think of. The only limit is your imagination.

To learn more about the API and how to pull in your data from Garchi CMS, you can read the [API documentation](https://garchi.co.uk/docs/v2).


# Content Heirarchy

In Garchi CMS, the content heirarchy is as follows: 
At the top level, you have **Spaces**. Each Space contains content in the form of **Pages** and  **Data Items**.

To make it more clear, Pages are used to manage content for your website while Data Items are used to manage structured data like products, blog posts, events etc. which can be used across your site.


# Spaces

Space allow you to organize your Garchi CMS data into separate work areas. For example, you might have one Space for your website content and another Space for your mobile app content. Each Space has its own set of Pages and Data Items. In major cases, Space uuid is used to manage content when making API calls or using the SDK.

# Pages

Pages are the building blocks of your website. They are made up of sections, which are created using section templates. You can create as many pages as you need in your Space, and each page can have its own unique content.

Each page maps to Page component in your codebase. Generally a dynamic route is preferred if the framework being used (Next, Nuxt etc.) supports it. Pages are fetched using the slug (eg: /about, /contact-us), space uid and mode (live,draft). 

Page can be created using the [API](https://garchi.co.uk/docs/v2#headless-web-POSTapi-v2-space--uid--create_page), using the SDK or using the MCP tool create-page-tool.

## Assets

The Assets are uploaded files that can only be used in your page sections. User has to upload the asset to the Garchi CMS before using it in the page section.


To upload assets:

1. Go to your Garchi CMS dashboard ---> Headless Web  ---> Assets in the sidebar.
2. Click the "Add new asset" button.
3. You can either upload a file from your computer or cloud resource.
4. To upload multiple files from your computer click on Upload file button. You can keep the name field blank in case if you are uploading multiple files otherwise for single file you can fill in the name field.
5. To upload a file from third party resource or cloud hosted resource click on Upload using external url button. Enter the url.
6. Click Save

To edit an asset

1. Click on the Pen or edit icon
2. Change the details/file
3. Click save.
   

To delete an asset click on a Trash Icon.

## Section Template

Section templates are reusable page section components in Garchi CMS. They act as blueprints for sections on your pages.

To use a section template in your site, you need to have the corresponding component in your codebase. 
For example, a "Hero" template in Garchi CMS should have a <Hero /> (Hero.jsx/tsx, Hero.vue, Hero.blade.php etc) component in your app.

Section templates can also be created using the API, SDK or MCP tools.
When using API you need to pass the all section templates present in the space otherwise the ones not passed will be deleted.
The MCP tool handles this very well.

## Adding Template Props

Prop template allow you to pass dynamic data to your section templates. When creating section templates you can pass props which are used to manage dynamic content of a Section. 

Let's take an example of a React TeamCard component which has image, title and name

```jsx
// TeamCard.jsx
function TeamCard({image, title, name})
{
    return (
    <div className="css_classes">
        <img src={image} alt={name} />
        <h2>{name}</h2>
        <p>{title}</p>
    </div>
    )
}
```

The Section template named TeamCard needs to be created in Garchi CMS. In this case TeamCard template has prop template of three props. image of type media, title and name of type text.

Now TeamCard template can be used as a reusable section across page/s and the content for it can either be managed from Garchi CMS dashboard or by using MCP tool create-section-content-tool. 

Each section can also have nested sections. Each section's content is added individually using the MCP tool of create-section-content-tool.



# Data Items


Data items enables creating of reusable, dynamic content like blog posts, products, etc. to display on your site.

Unlike pages, data items are not mapped to a specific component in your codebase. You can use them in any component as functions and have the returned value rendered. For example, you can have a ProductCard component which takes in product data and renders it. The product data can be fetched from Garchi CMS using API or SDK as a data item and then passed to the ProductCard component.

Data item can be created using the API, SDK or using the MCP tool create-data-item-tool.


Each data item has one or many categories. Each data item has a base schema which includes the following fields:

1. Name - the item title
2. Slug - used in the item url and should be unique across the space. This can also be used as an identifier for the item while fetching it using API or SDK.
3. Categories - Assign to one or more categories
4. One Line description 
5. Detailed rich text description in HTML format


The base item schema also includes ecommerce fields for data items that are sellable like products. These fields are optional and can be used as per your requirements. The ecommerce fields include:

7. Stock
8. Price
9. Scratched price (for discount offers)
10. SKU

 


You can extend the schema by adding **extra details** as custom key-value pairs.


## Extra details

The main purpose of data items is to create a dynamic data model. For eg. an Article (data item) could have author, published_date and other fields. These fields are termed as item meta. These can be added using API, SDK or MCP tool named create-meta-for-item-tool.


### Efficiently Accessing Item Meta

The Item API returns metadata in the item_meta array:

```json
{
    "data": [
{
"item_id": 26,
...
 "item_meta": [
          {
              "key" : "website",
              "value": "https://adiranids.com",
              "type": "url"
          },
          {
              "key" : "linkedin",
              "value": "https://linkedin.com/adiranids",
              "type": "url"
          },
     ],
}
]
}

```

To get a specific meta value, you need to find it by key:

```javascript
let website = item.item_meta.find(i => i.key == 'website').value
```

This works but can be slow for large metadata arrays. To make it efficient,
flatten the metadata into an object for direct key access:

```javascript
// Flatten array into object
const flattenedMeta = item.item_meta.reduce((obj, meta) => {
  obj[meta.key] = meta.value
  return obj
}, {})

// Now directly access keys
let website = flattenedMeta.website

// console.log(flattenedMeta)
//{website: "https://adiranids.com", linkedin:"https://linkedin.com/adiranids"}

```

The key names become properties for O(1) lookup instead of searching the array.

This preserves the original metadata structure while optimizing access.




## Data item images

Each data items can have one main image generally used as a featured image and up to 8 additional images.
Each image needs to be uploaded manually using the Garchi CMS dashboard.

Images can be added by visit Garchi CMS dashboard ---> click on Manage --> Add Images


## Item options (E-commerce only feature)

Sometimes you might have a product which has additional attributes. For example a T-Shirt might have size, colour as attributes that your user wants to choose while adding the product in the basket. For such cases we have a feature for each item to add an options tree (attribute tree). This is separate from item meta is specifically designed to handle sellable item attributes and variants. This can be done using the API.

You need to start by adding a main option which has sub options under it.

In our T-Shirt example, main options could Size, Colour.

Then you need to specify for a main option how many minimum sub options user can pick. This is useful for validating on the front end to make sure that the user picks right amount of minimum options.

We can now have S,M,L,XL,XXL as sub options for Size main option. If there is any additional price involved then you can add an additional price for each sub option. 

**Note**: Validation for things like minimum main option quantities and additional sub option pricing needs to be handled in your application code.

The item data provides the basic configuration, but your app code should validate quantities, calculate totals properly, prevent incorrect selections, etc. based on the item configuration.

For example, if a main option requires a minimum of 2 selections, your app would need to enforce that minimum quantity at the time of purchase. The item data provides the minimum quantity rule, but does not automatically enforce it.

Similarly, any conditional pricing for sub options would need to be calculated correctly in the cart/checkout process. The item data provides the pricing rules, but the totals need to be computed accurately in code.



## Categories

Each data item needs to have one or more categories.

Categories are useful to club items together.

Categories can be managed using the API, SDK or using the MCP tool manage-category-tool.


# Good to know

- For data items, Garchi CMS supports built in vector stores for semantic search. For this user needs to provide their provider API key in the Garchi CMS dashboard. Currently we support OpenAI and Voyage. Once the vector store is set up, you can use the semantic search API to get relevant items based on a search query.

- OpenAPI specification for Garchi CMS can be found at [https://garchi.co.uk/docs/v2.openapi](https://garchi.co.uk/docs/v2.openapi)

- Garchi CMS has SDKs for Node and PHP. It got starter kits for Next, Nuxt, Laravel and SvelteKit. Starter kits can be installed using command `npx @lumenharbor/garchi-starter-kit -k next` replacing next with nuxt, laravel or sveltekit as per your requirements. For a fresh project a starter kit is recommended. Starter kits uses Tailwind CSS for styling and have example components to render pages. Starter kits come with respective SDKs and .env files.



