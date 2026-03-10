'use strict';

const { Router } = require('express');
const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
