export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    payload: {
      service: 'AdoptMe API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};
