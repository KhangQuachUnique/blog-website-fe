import { useAuth } from "../../hooks/useAuth";
import { ACCESS_TOKEN_KEY } from "../../constants/auth";
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../../utils/avatarHelper';

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏠 Home Page - Debug Info
          </h1>
          <p className="text-gray-600">Thông tin authentication và user hiện tại</p>
        </div>

        {/* Auth Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-pink-500">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔐</span>
            Authentication Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-40">Is Authenticated:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isAuthenticated 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isAuthenticated ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-40">Is Loading:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isLoading 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isLoading ? '⏳ Loading...' : '✓ Ready'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-40">Token in localStorage:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                accessToken
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {accessToken ? '✓ Present' : '✗ None'}
              </span>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {isAuthenticated && user ? (
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              User Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">User ID</p>
                <p className="text-lg font-semibold text-gray-800">{user.id}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Username</p>
                <p className="text-lg font-semibold text-gray-800">{user.username}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-800">{user.email}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Role</p>
                <p className="text-lg font-semibold text-gray-800">{user.role || 'N/A'}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Avatar</p>
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="User avatar" 
                    className="w-20 h-20 rounded-full border-2 border-pink-300"
                  />
                ) : (
                  <div className="w-20 h-20">
                    <Avatar {...stringAvatar(user.username, 80, '1.8rem')} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-400">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Not Authenticated
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin user.
            </p>
            <a 
              href="/login" 
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Đăng nhập ngay
            </a>
          </div>
        )}

        {/* Token Preview */}
        {accessToken && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎫</span>
              JWT Token
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-mono break-all text-gray-700">
                {accessToken}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Token này được tự động gửi kèm trong mọi API request qua Authorization header
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <a 
            href="/newsfeed" 
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
          >
            📰 Go to Newsfeed
          </a>
          <a 
            href="/create-post" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
          >
            ✏️ Create Post
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
