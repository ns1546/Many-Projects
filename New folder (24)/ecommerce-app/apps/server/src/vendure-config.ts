import { VendureConfig } from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { DefaultJobQueuePlugin, DefaultSearchPlugin } from '@vendure/core';
import path from 'path';

const IS_DEV = process.env.APP_ENV !== 'production';
import { StorefrontSettingsPlugin } from './plugins/storefront-settings-plugin';

import { Asset } from '@vendure/core';

export const config: VendureConfig = {
    apiOptions: {
        port: 3002,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        ...(IS_DEV ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: 'superadmin',
            password: 'superadmin',
        },
        cookieOptions: {
          secret: 'vendure-secret',
        },
    },
    dbConnectionOptions: {
        type: 'sqlite',
        synchronize: false,
        database: path.join(__dirname, '../vendure.sqlite'),
        logger: 'advanced-console',
        logging: ['error', 'warn'],
    },
    paymentOptions: {
        paymentMethodHandlers: [],
    },
    customFields: {
        GlobalSettings: [
            { name: 'heroBanner', type: 'string', public: true },
            { name: 'heroTitle', type: 'string', public: true },
            { name: 'heroSubtitle', type: 'string', public: true },
            { name: 'heroLink', type: 'string', public: true },
            { name: 'promoText', type: 'string', public: true },
            { name: 'promoLink', type: 'string', public: true },
        ]
    },
    plugins: [
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: 'http://localhost:3003/verify',
                passwordResetUrl: 'http://localhost:3003/password-reset',
                changeEmailAddressUrl: 'http://localhost:3003/verify-email-address-change'
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: 3002,
            adminUiConfig: {
                apiHost: 'http://localhost',
                apiPort: 3002,
            },
        }),
        StorefrontSettingsPlugin,
    ],
};
