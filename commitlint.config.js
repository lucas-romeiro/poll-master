export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      [
        'domain',
        'application',
        'infra',
        'http',
        'prisma',
        'docker',
        'api',
        'deps',
      ],
    ],
  },
};
