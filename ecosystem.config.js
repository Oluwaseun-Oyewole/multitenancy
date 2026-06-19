module.exports = {
  apps: [
    {
      name: 'multi_tenancy',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '/home/tenant/app/.env',
      max_restarts: 10,
      min_uptime: '5s',
      restart_delay: 3000,
      out_file: '/var/log/multi-tenancy/out.log',
      error_file: '/var/log/multi-tenancy/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '512M',
    },
  ],
};
