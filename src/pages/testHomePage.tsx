import React from 'react';
import { CommentsSection } from '../components/comments/CommentsSection';

// Mock user for testing - you can replace with real auth later
const mockCurrentUser = {
  id: 1,
  username: 'TestUser',
  avatarUrl: 'https://via.placeholder.com/40'
};

// Mock posts data based on Supabase sample
const mockPosts = [
  {
    id: 1,
    title: 'Bài viết đầu tiên về React',
    content: 'Đây là bài viết về React framework và các tính năng mới...',
    author: 'Admin',
    createdAt: '2025-12-01'
  },
  {
    id: 2, 
    title: 'Hướng dẫn TypeScript cơ bản',
    content: 'TypeScript giúp code JavaScript an toàn hơn với type checking...',
    author: 'Developer',
    createdAt: '2025-12-01'
  }
];

export const TestHomePage: React.FC = () => {
  console.log('TestHomePage is rendering');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Homepage - Comment System
        </h1>
        
        <div className="bg-green-100 p-4 rounded mb-4">
          <p>✅ Component is working! Time: {new Date().toLocaleTimeString()}</p>
        </div>
        
        <div className="space-y-12">
          {mockPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>Tác giả: {post.author}</span>
                  <span>•</span>
                  <span>{post.createdAt}</span>
                  <span>•</span>
                  <span className="text-blue-600">Post ID: {post.id}</span>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="px-6 py-4">
                <p className="text-gray-700 leading-relaxed">
                  {post.content}
                </p>
              </div>
              
              {/* Comments Section - Temporarily disabled for testing */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-blue-600">Comments section loading...</p>
                {/* <CommentsSection 
                  postId={post.id}
                  currentUser={mockCurrentUser}
                /> */}
              </div>
            </div>
          ))}
        </div>
        
        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Test Instructions:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Post ID 1 đã có {7} comments mẫu trong database</li>
            <li>• Post ID 2 đã có {3} comments mẫu trong database</li>
            <li>• Thử tạo comment mới để test API create</li>
            <li>• Check browser network tab để xem API calls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};