export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message);
    return res.status(400).json({ message: "Validation failed", issues });
  }
  next();
};
