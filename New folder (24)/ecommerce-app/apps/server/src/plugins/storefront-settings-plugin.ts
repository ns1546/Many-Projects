import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { Resolver, Query } from '@nestjs/graphql';
import { GlobalSettingsService, Ctx, RequestContext } from '@vendure/core';
import gql from 'graphql-tag';

const shopApiExtensions = gql`
    type StorefrontSettingsCustomFields {
        heroTitle: String
        heroSubtitle: String
        heroBanner: String
        heroLink: String
        promoText: String
        promoLink: String
        heroBannerTitle: String
        heroBannerSubtitle: String
        heroBannerImage: String
    }

    type StorefrontSettings {
        customFields: StorefrontSettingsCustomFields
    }

    extend type Query {
        storefrontSettings: StorefrontSettings
    }
`;

@Resolver()
export class StorefrontSettingsResolver {
    constructor(private globalSettingsService: GlobalSettingsService) {}

    @Query()
    async storefrontSettings(@Ctx() ctx: RequestContext) {
        const settings = await this.globalSettingsService.getSettings(ctx);
        const cf = (settings?.customFields || {}) as Record<string, any>;
        const heroTitle = cf.heroTitle || cf.heroBannerTitle || "Experience Next-Gen Sound & Design";
        const heroSubtitle = cf.heroSubtitle || cf.heroBannerSubtitle || "Discover studio-tuned acoustics, CNC mechanical keyboards, and aerospace titanium wearables built for creators who demand excellence.";
        const heroBanner = cf.heroBanner || cf.heroBannerImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop";
        const promoText = cf.promoText || "SPRING EVENT: Up to 35% off flagship audio & tech essentials. Use code TECH20 for an extra 20% off.";
        const promoLink = cf.promoLink || "/search";

        return {
            customFields: {
                heroTitle,
                heroSubtitle,
                heroBanner,
                heroLink: cf.heroLink || "/search",
                promoText,
                promoLink,
                heroBannerTitle: heroTitle,
                heroBannerSubtitle: heroSubtitle,
                heroBannerImage: heroBanner,
            }
        };
    }
}

@VendurePlugin({
    imports: [PluginCommonModule],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [StorefrontSettingsResolver],
    },
})
export class StorefrontSettingsPlugin {}
