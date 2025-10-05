// Standardized API response format
const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Success responses
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, 'success', message, data);
};

// Error responses
const sendError = (res, message, statusCode = 400) => {
  return sendResponse(res, statusCode, 'error', message);
};

// Pagination helper
const getPagination = (page, limit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  return {
    page: pageNumber,
    limit: limitNumber,
    skip
  };
};

// Format pagination response
const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate random string
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Check if user is online (for real-time features)
const isUserOnline = (connectedUsers, userId) => {
  return connectedUsers.has(userId.toString());
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  getPagination,
  formatPaginationResponse,
  asyncHandler,
  generateRandomString,
  formatDate,
  isUserOnline
};