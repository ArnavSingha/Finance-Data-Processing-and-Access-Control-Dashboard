export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const normalizePagination = (
  page?: number,
  limit?: number
): { page: number; limit: number; skip: number } => {
  const normalizedPage = !page || page < 1 ? DEFAULT_PAGE : page;
  const normalizedLimit = !limit || limit < 1 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
};

