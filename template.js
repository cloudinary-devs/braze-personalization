/*
* A template for Braze-Cloudinary integration that allows marketers to use
* a given asset from a campaign, based on Braze liquid tags and Cloudinary metadata
*
* Read https://cloudinary.com/documentation/custom_functions#javascript_filters for
* overview and for instructions how to deploy
*
*
* *Adopting the below template*
* Skip the "Helper functions" section and
* Edit the "Main" section with your use case fields, values, and logic
*
*
* *URL structure to be put in Braze*
* https://<Base_URL>/<resource_type>/list/$locale_!en!/$audience_!Internal!/fn_select:js:v<js_epoch_seconds>:template.js/v<url_epoch_seconds>/<campaign_tag>.json
* See https://github.com/cloudinary-devs/braze-personalization/blob/main/README.md for more details.
*/

/* Helper functions */
function getTxParts(tx) {
    const txParts = {};
    tx.split("/").forEach(el => el.split(',').forEach(el2 => {
        const parts = el2.split('_', 2);
        if (parts[0] && parts[1]) {
            txParts[parts[0]] = parts[1]
        }
    }));
    return txParts;
}
function getParam(txParts, arg) {
    return txParts["$" + arg]?.split('!')[1];
}
function getMetadataDict(metadata) {
    return metadata.reduce((acc, el) => {
        acc[el.external_id] = el;
        return acc;
    }, {});
}
function haveMetadata(md, arg, value) {
    return md[arg]?.value === value ||  md[arg]?.value[value];
}
function fallbackImage(publicId, tx) {
    return { public_id: publicId,
             transformation: tx.substring(0, tx.lastIndexOf("/")),
    };
}
/* End helper functions */

/* Main */
function main() {
    // Boilerplate code
    const content = JSON.parse(getDocument());
    const tx = getContext()["transformation"];
    const txParts = getTxParts(tx);

    // Input parameters
    const locale = getParam(txParts, "locale");
    const audience = getParam(txParts, "audience");

    // Main logic
   for (const resource of content) {
        if (!resource.metadata) continue;
        try {
            const md = getMetadataDict(resource.metadata);
            if (
                haveMetadata(md, "audience", audience) &&
                haveMetadata(md, "locale", locale)
            ) {
                return resource;
            }
        } catch (e) {}
    }

    // Default if no matches found (fallback)
    return fallbackImage("samples/two-ladies", tx);
}
