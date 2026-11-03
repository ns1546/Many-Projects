import { bootstrap } from '@vendure/core';
import { config } from './vendure-config';

bootstrap(config)
    .then(() => {
        console.log('Vendure backend is running on http://localhost:3002');
    })
    .catch((err) => {
        console.error(err);
    });
