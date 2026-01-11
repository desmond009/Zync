/**
 * Calculate pagination metadata
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

/**
 * Calculate skip value for pagination
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 * @returns {number} Number of records to skip
 */
export const getSkip = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Parse pagination query parameters
 * @param {Object} query - Request query object
 * @returns {Object} Parsed pagination parameters
 */
export const parsePaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100); // Max 100 items per page
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
};

/**
 * Build Prisma orderBy object
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Object} Prisma orderBy object
 */
export const buildOrderBy = (sortBy, sortOrder) => {
  return { [sortBy]: sortOrder };
};

/**
 * Cursor-based pagination helper (for infinite scroll)
 * @param {string} cursor - Cursor value (usually ID or timestamp)
 * @param {number} limit - Number of records to fetch
 * @returns {Object} Prisma cursor configuration
 */
export const buildCursorConfig = (cursor, limit) => {
  const config = {
    take: limit,
    skip: cursor ? 1 : 0, // Skip the cursor itself
  };

  if (cursor) {
    config.cursor = { id: cursor };
  }

  return config;
};

/**
 * Format cursor-based pagination response
 * @param {Array} data - Array of records
 * @param {number} limit - Records per page
 * @returns {Object} Formatted response with cursor
 */
export const formatCursorResponse = (data, limit) => {
  const hasMore = data.length > limit;
  const records = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? records[records.length - 1].id : null;

  return {
    data: records,
    pagination: {
      nextCursor,
      hasMore,
    },
  };
};
