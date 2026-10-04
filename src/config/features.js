function envFlag(name, fallback = false) {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

export const features = Object.freeze({
  tiktokLogin: envFlag("TIKTOK_LOGIN_ENABLED"),
  tiktokContentUpload: envFlag("TIKTOK_CONTENT_UPLOAD_ENABLED"),
  tiktokDirectPost: envFlag("TIKTOK_DIRECT_POST_ENABLED"),

  tiktokBusiness: envFlag("TIKTOK_BUSINESS_ENABLED"),
  tiktokCampaignWrite: envFlag("TIKTOK_CAMPAIGNS_WRITE_ENABLED"),

  tiktokShop: envFlag("TIKTOK_SHOP_ENABLED"),

  tiendanube: envFlag("TIENDANUBE_ENABLED"),
  whatsapp: envFlag("WHATSAPP_ENABLED"),

  automation: envFlag("AUTOMATION_ENABLED"),
  automationAutoPublish: envFlag("AUTOMATION_AUTO_PUBLISH"),

  mcp: envFlag("MCP_ENABLED"),
  mcpReadonly: envFlag("MCP_READONLY", true)
});
