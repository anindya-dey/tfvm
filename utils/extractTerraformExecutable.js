const extractTerraformLink = (link) => {
    return link?.attribs?.href; //?.replace(/^\/terraform\//, '').replace(/\/$/, '');
}

export default extractTerraformLink;
