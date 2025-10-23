# Braze-Cloudinary Integration Template

A JavaScript template for integrating Braze campaigns with Cloudinary that enables marketers to dynamically select campaign assets based on Braze liquid tags and Cloudinary metadata.

## Overview

This template allows you to automatically deliver contextually relevant assets to users based on audience segment, locale, or other attributes.

Key Features:

- Use tags in Cloudinary for all assets belonging to a campaign(s)
- Use SMD in Cloudinary to indicate asset attributes (e.g., locale, audience)
- Use targeting variables with liquid tags from Braze to drive selection logic
- Use a Cloudinary URL with variables representing the targeting attributes in the connected content editor in Braze
- Use fn_select and JavaScript filter to resolve the best fit image (JavaScript filter is uploaded into Cloudinary)

## URL Structure

The URL structure to be used in Braze campaigns:

```text
https://<Base_URL>/<resource_type>/list/$locale_!en!/$audience_!Internal!/fn_select:js:v<js_epoch_seconds>:template.js/v<url_epoch_seconds>/<campaign_tag>.json
```

### URL Breakdown

- **Base_URL**: The first part of your Cloudinary media delivery URLs
- **resource_type**: `video` for videos, `image` for images
- **list**: Fixed string required by the syntax
- **$locale_!en!**: Sets the `locale` script parameter. Value 'en' comes from Braze liquid tags
- **$audience_!Internal!**: Sets the `audience` script parameter
- **fn_select:js:v<epoch_seconds>:template.js**: Calls the custom script
  - If the script is in a subfolder, use colon (:) as separator (e.g., `scripts:template.js`)
  - Use current `<js_epoch_seconds>` timestamp for faster propagation when modifying the script
- **<campaign_tag>**: Cloudinary tag assigned to all campaign assets
- **.json**: Fixed extension required by the syntax

## How It Works

This template.js filters and selects assets from a Cloudinary campaign based on metadata parameters like `locale` and `audience`. It's designed to be deployed as a Cloudinary custom function.

For detailed information about Cloudinary custom functions, see the [official documentation](https://cloudinary.com/documentation/custom_functions#javascript_filters).

### Parameters

The script accepts two main parameters:

- **locale**: Language/locale identifier (e.g., 'en', 'fr', 'de')
- **audience**: Audience segment identifier (e.g., 'Internal', 'Premium')

### Logic Flow

1. Parses the URL transformation string to extract parameters
2. Iterates through available campaign resources
3. Checks each resource's metadata for matching `locale` and `audience` values
4. Returns the first resource that matches both criteria
5. Falls back to a default image if no match is found

### Helper Functions

- **getTxParts(tx)**: Parses the transformation string into key-value pairs
- **getParam(txParts, arg)**: Extracts a specific parameter value from parsed transformation parts
- **getMetadataDict(metadata)**: Converts metadata array into a dictionary for easier lookup
- **haveMetadata(md, arg, value)**: Checks if metadata contains a specific key-value pair
- **fallbackImage(publicId, tx)**: Returns a fallback image when no matches are found

### Main Function

The main function:

1. Retrieves the document content (campaign resources)
2. Extracts transformation parameters from the URL
3. Gets the `locale` and `audience` parameters
4. Searches for a matching resource based on metadata
5. Returns the matched resource or fallback image

## Customization

To adapt this template for your use case:

1. **Skip the "Helper functions" section** - these are boilerplate utilities
2. **Edit the "Main" section** with your specific:
   - Parameter names
   - Metadata field names
   - Matching logic
   - Fallback behavior

## Fallback Behavior

If no resource matches the specified `locale` and `audience` parameters, the script returns:

- Default image: `samples/two-ladies`
- Preserves the transformation chain from the original URL

## Metadata Structure

The script expects Cloudinary metadata in the following format:

```json
[
  {
    "public_id": "asset_name",
    "metadata": [
      {
        "external_id": "locale",
        "value": "en"
      },
      {
        "external_id": "audience",
        "value": "Internal"
      }
    ]
  }
]
```

## Deployment

1. Upload the script to your Cloudinary account
2. Note the script's public_id and location
3. Construct URLs using the format above
4. Use the URLs in your Braze campaign templates
5. Update the `<js_epoch_seconds>` timestamp when you modify the script

## Example

To target English language content for Internal audience:

```text
https://res.cloudinary.com/demo/image/list/$locale_!en!/$audience_!Internal!/fn_select:js:v1234567890:template.js/v1234567890/summer_campaign.json
```
