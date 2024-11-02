import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Mindelvate API',
    description: 'Mind API description',
    version: '1.5',
    path: 'api',
  },
  // graphql: {
  //   playgroundEnabled: true,
  //   debug: true,
  //   schemaDestination: './src/schema.graphql',
  //   sortSchema: true,
  // },
  security: {
    expiresIn: '2d',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  rest: {
    apiPrefix: '/api/v1',
  },
};

export default (): Config => config;
