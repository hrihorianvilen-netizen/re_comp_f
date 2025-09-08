'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Reactions {
  love: number;
  like: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

interface NewsComment {
  id: string;
  userId: string;
  userName: string;
  displayName: string;
  content: string;
  createdAt: Date;
  reactions: Reactions;
  replies: NewsReply[];
}

interface NewsReply {
  id: string;
  userId: string;
  userName: string;
  displayName: string;
  content: string;
  createdAt: Date;
  reactions: Reactions;
}

// Mock news data with slugs
const mockNewsData = {
  'top-10-ecommerce-platforms-2024': {
    id: '1',
    slug: 'top-10-ecommerce-platforms-2024',
    title: 'Top 10 E-commerce Platforms to Watch in 2024',
    content: `The e-commerce landscape is rapidly evolving with new platforms emerging every day. From innovative marketplaces to specialized niche platforms, businesses have more options than ever before to reach their customers. This comprehensive guide explores the top platforms that are revolutionizing online retail, including their unique features, market positioning, and growth potential.

    Learn how these platforms are leveraging AI, social commerce, and mobile-first strategies to capture market share and deliver exceptional customer experiences. We dive deep into each platform's strengths, weaknesses, and unique selling propositions.

    1. Platform One: Leading the market with innovative features
    2. Platform Two: Specializing in niche markets
    3. Platform Three: Mobile-first approach
    4. Platform Four: AI-powered recommendations
    5. Platform Five: Social commerce integration

    The future of e-commerce is bright, with these platforms leading the charge towards more personalized, efficient, and engaging shopping experiences.`,
    image: '/images/news/vinuin.png',
    category: 'Newly updated',
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    author: 'Sarah Johnson',
    views: 1250,
    likes: 342,
    shares: 89
  },
  'consumer-trust-online-reviews-study': {
    id: '2',
    slug: 'consumer-trust-online-reviews-study',
    title: 'Consumer Trust in Online Reviews: A Comprehensive Study',
    content: `A groundbreaking study conducted across 10,000 consumers reveals the critical role of online reviews in modern purchasing decisions. The research shows that 93% of consumers read reviews before making a purchase, and authentic, detailed reviews significantly impact conversion rates.

    This article delves into the psychology behind review trust, the impact of fake reviews, and how businesses can build credibility through transparent review systems.

    Key findings include:
    - 87% of consumers trust online reviews as much as personal recommendations
    - Detailed reviews with pros and cons are 3x more trustworthy
    - Review recency matters: 73% of consumers only pay attention to reviews written in the last month
    - Verified purchase badges increase trust by 62%

    Businesses need to understand these dynamics to build effective review strategies that foster trust and drive conversions.`,
    image: '/images/news/vinuin.png',
    category: 'Newly updated',
    publishedAt: '2024-01-12',
    readTime: '8 min read',
    author: 'Michael Chen',
    views: 890,
    likes: 234,
    shares: 67
  },
  'ai-customer-service-revolution': {
    id: '3',
    slug: 'ai-customer-service-revolution',
    title: 'The Rise of AI in Customer Service',
    content: `Artificial Intelligence is transforming customer service from reactive to proactive. Companies are now using AI-powered chatbots, sentiment analysis, and predictive analytics to anticipate customer needs and resolve issues before they escalate.

    This article examines successful AI implementations, ROI metrics, and future trends in AI-driven customer support.

    Major implementations include:
    - 24/7 automated support reducing response times by 85%
    - Sentiment analysis preventing 40% of potential escalations
    - Predictive analytics improving first-call resolution by 30%
    - Personalized recommendations increasing satisfaction scores by 25%

    The integration of AI doesn't replace human agents but empowers them to handle more complex issues while AI manages routine inquiries.`,
    image: '/images/news/vinuin.png',
    category: 'Technology',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    author: 'Emily Davis',
    views: 2100,
    likes: 456,
    shares: 123
  }
};

// Mock comments data
const mockComments: NewsComment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    displayName: 'Tech Enthusiast',
    content: 'Great article! Really helped me understand the current e-commerce landscape.',
    createdAt: new Date('2024-01-16'),
    reactions: { love: 5, like: 7, haha: 0, wow: 2, sad: 0, angry: 0 },
    replies: [
      {
        id: 'reply1',
        userId: 'user2',
        userName: 'Jane Smith',
        displayName: 'E-commerce Expert',
        content: 'I agree! The insights about AI integration are particularly valuable.',
        createdAt: new Date('2024-01-16'),
        reactions: { love: 2, like: 3, haha: 0, wow: 0, sad: 0, angry: 0 }
      }
    ]
  },
  {
    id: '2',
    userId: 'user3',
    userName: 'Mike Johnson',
    displayName: 'Business Owner',
    content: 'Would love to see more details about pricing models for these platforms.',
    createdAt: new Date('2024-01-17'),
    reactions: { love: 1, like: 6, haha: 0, wow: 1, sad: 0, angry: 0 },
    replies: []
  }
];

export default function PostDetailPage() {
  const params = useParams();
  const pslug = params?.pslug as string;
  
  // Remove 'p-' prefix to get the actual slug
  const slug = pslug?.startsWith('p-') ? pslug.substring(2) : pslug;
  
  // Find post by slug, default to first post if not found
  const news = Object.values(mockNewsData).find(post => post.slug === slug) || Object.values(mockNewsData)[0];
  
  const [comments, setComments] = useState<NewsComment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyDisplayName, setReplyDisplayName] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleAddComment = () => {
    if (newComment.trim() && displayName.trim()) {
      const comment: NewsComment = {
        id: `comment-${Date.now()}`,
        userId: 'current-user',
        userName: 'Current User',
        displayName: displayName,
        content: newComment,
        createdAt: new Date(),
        reactions: { love: 0, like: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setDisplayName('');
    }
  };

  const handleAddReply = (commentId: string) => {
    if (replyContent.trim() && replyDisplayName.trim()) {
      const reply: NewsReply = {
        id: `reply-${Date.now()}`,
        userId: 'current-user',
        userName: 'Current User',
        displayName: replyDisplayName,
        content: replyContent,
        createdAt: new Date(),
        reactions: { love: 0, like: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
      };
      
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        return comment;
      }));
      
      setReplyContent('');
      setReplyDisplayName('');
      setReplyTo(null);
    }
  };

  const handleReaction = (commentId: string, reactionType: keyof Reactions) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          reactions: {
            ...comment.reactions,
            [reactionType]: comment.reactions[reactionType] + 1
          }
        };
      }
      return comment;
    }));
  };

  const handleReplyReaction = (commentId: string, replyId: string, reactionType: keyof Reactions) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === replyId) {
              return {
                ...reply,
                reactions: {
                  ...reply.reactions,
                  [reactionType]: reply.reactions[reactionType] + 1
                }
              };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#198639]">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li>
              <Link href="/tin-tuc" className="text-gray-500 hover:text-[#198639]">
                Tin tức
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {news.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Article Header */}
              <div className="relative h-64 md:h-96">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                {/* Category and Date */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#198639] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {news.category}
                  </span>
                  <span className="text-sm text-gray-500">{news.publishedAt}</span>
                  <span className="text-sm text-gray-500">{news.readTime}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {news.title}
                </h1>

                {/* Author and Stats */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{news.author}</p>
                      <p className="text-xs text-gray-500">Author</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {news.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {news.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 2.943-9.543 7a9.001 9.001 0 011.827 4.026" />
                      </svg>
                      {news.shares}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  {news.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Share Buttons */}
                <div className="mt-8 flex justify-center pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {/* Facebook */}
                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    
                    {/* X/Twitter */}
                    <button className="p-2 bg-black text-white rounded-full hover:bg-gray-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    
                    {/* LinkedIn */}
                    <button className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                    
                    {/* WhatsApp */}
                    <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>
                    
                    {/* Telegram */}
                    <button className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 1 0 24 12a12 12 0 0 0-12.056-12zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </button>
                    
                    {/* Threads */}
                    <button className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.124-.742-.42-1.412-.86-1.897-.59-.65-1.445-.99-2.544-.998-1.077 0-2.257.33-2.25 1.656l-2.045-.119c.06-2.579 2.652-3.49 4.312-3.49 1.671 0 2.991.523 3.925 1.554.758.838 1.244 1.975 1.446 3.38.018.13.028.258.028.384.349.033.68.098.988.191 1.043.316 1.896.919 2.47 1.743.783 1.128 1.045 2.608.785 4.402-.308 2.12-1.442 3.837-3.374 5.102-1.728 1.132-3.718 1.817-5.919 2.039a16.863 16.863 0 0 1-.56.012Zm-1.658-8.718c-1.948.081-3.023.812-3.023 2.055.022.623.302 1.147.814 1.52.548.397 1.269.582 2.027.517 2.22-.19 3.415-1.757 3.423-4.492-.821-.109-1.554-.143-2.113-.143-.37 0-.775.018-1.128.043Z"/>
                      </svg>
                    </button>
                    
                    {/* Pinterest */}
                    <button className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Comments ({comments.length})
              </h2>

              {/* Add Comment Form */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639]"
                  />
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment... (You can use emojis! 😊)"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639] resize-none"
                      rows={3}
                    />
                    <div className="absolute right-2 top-2">
                      <button
                        type="button"
                        onClick={() => {
                          const emojis = ['😊', '👍', '❤️', '🎉', '😂', '🤔', '👏', '🔥', '💯', '✨'];
                          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                          setNewComment(prev => prev + randomEmoji);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Add emoji"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddComment}
                    className="bg-[#198639] text-white px-6 py-2 rounded-lg hover:bg-[#145a2c] transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {(showAllComments ? comments : comments.slice(0, 2)).map(comment => (
                  <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{comment.displayName}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setReplyTo(comment.id)}
                            className="text-sm text-[#198639] hover:underline"
                          >
                            Reply
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReaction(comment.id, 'love')}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-red-50 transition-colors group"
                              title="Love"
                            >
                              <span className="text-lg">❤️</span>
                              {comment.reactions.love > 0 && <span className="text-xs text-gray-600">{comment.reactions.love}</span>}
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'like')}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors group"
                              title="Like"
                            >
                              <span className="text-lg">👍</span>
                              {comment.reactions.like > 0 && <span className="text-xs text-gray-600">{comment.reactions.like}</span>}
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'haha')}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-yellow-50 transition-colors group"
                              title="Haha"
                            >
                              <span className="text-lg">😂</span>
                              {comment.reactions.haha > 0 && <span className="text-xs text-gray-600">{comment.reactions.haha}</span>}
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'wow')}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-orange-50 transition-colors group"
                              title="Wow"
                            >
                              <span className="text-lg">😮</span>
                              {comment.reactions.wow > 0 && <span className="text-xs text-gray-600">{comment.reactions.wow}</span>}
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'sad')}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors group"
                              title="Sad"
                            >
                              <span className="text-lg">😢</span>
                              {comment.reactions.sad > 0 && <span className="text-xs text-gray-600">{comment.reactions.sad}</span>}
                            </button>
                            <button
                              onClick={() => handleReaction(comment.id, 'angry')}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-red-50 transition-colors group"
                              title="Angry"
                            >
                              <span className="text-lg">😡</span>
                              {comment.reactions.angry > 0 && <span className="text-xs text-gray-600">{comment.reactions.angry}</span>}
                            </button>
                          </div>
                        </div>

                        {/* Reply Form */}
                        {replyTo === comment.id && (
                          <div className="mt-4 space-y-3">
                            <input
                              type="text"
                              value={replyDisplayName}
                              onChange={(e) => setReplyDisplayName(e.target.value)}
                              placeholder="Your display name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] text-sm"
                            />
                            <div className="relative">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply... (You can use emojis! 😊)"
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] resize-none text-sm"
                                rows={2}
                              />
                              <div className="absolute right-2 top-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const emojis = ['😊', '👍', '❤️', '🎉', '😂', '🤔', '👏', '🔥', '💯', '✨'];
                                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                                    setReplyContent(prev => prev + randomEmoji);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-0.5"
                                  title="Add emoji"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddReply(comment.id)}
                                className="bg-[#198639] text-white px-4 py-1.5 rounded-md text-sm hover:bg-[#145a2c]"
                              >
                                Post Reply
                              </button>
                              <button
                                onClick={() => {
                                  setReplyTo(null);
                                  setReplyContent('');
                                  setReplyDisplayName('');
                                }}
                                className="text-gray-600 px-4 py-1.5 text-sm hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3 ml-4">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium text-gray-900 text-sm">
                                      {reply.displayName}
                                    </h5>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleReplyReaction(comment.id, reply.id, 'love')}
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-red-50 transition-colors"
                                      title="Love"
                                    >
                                      <span className="text-sm">❤️</span>
                                      {reply.reactions.love > 0 && <span className="text-xs text-gray-600">{reply.reactions.love}</span>}
                                    </button>
                                    <button
                                      onClick={() => handleReplyReaction(comment.id, reply.id, 'like')}
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-blue-50 transition-colors"
                                      title="Like"
                                    >
                                      <span className="text-sm">👍</span>
                                      {reply.reactions.like > 0 && <span className="text-xs text-gray-600">{reply.reactions.like}</span>}
                                    </button>
                                    <button
                                      onClick={() => handleReplyReaction(comment.id, reply.id, 'haha')}
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-yellow-50 transition-colors"
                                      title="Haha"
                                    >
                                      <span className="text-sm">😂</span>
                                      {reply.reactions.haha > 0 && <span className="text-xs text-gray-600">{reply.reactions.haha}</span>}
                                    </button>
                                    <button
                                      onClick={() => handleReplyReaction(comment.id, reply.id, 'wow')}
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-orange-50 transition-colors"
                                      title="Wow"
                                    >
                                      <span className="text-sm">😮</span>
                                      {reply.reactions.wow > 0 && <span className="text-xs text-gray-600">{reply.reactions.wow}</span>}
                                    </button>
                                    <button
                                      onClick={() => handleReplyReaction(comment.id, reply.id, 'sad')}
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-blue-50 transition-colors"
                                      title="Sad"
                                    >
                                      <span className="text-sm">😢</span>
                                      {reply.reactions.sad > 0 && <span className="text-xs text-gray-600">{reply.reactions.sad}</span>}
                                    </button>
                                    <button
                                      onClick={() => handleReplyReaction(comment.id, reply.id, 'angry')}
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-red-50 transition-colors"
                                      title="Angry"
                                    >
                                      <span className="text-sm">😡</span>
                                      {reply.reactions.angry > 0 && <span className="text-xs text-gray-600">{reply.reactions.angry}</span>}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* More Button */}
              {comments.length > 2 && !showAllComments && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    More
                  </button>
                </div>
              )}
              {showAllComments && comments.length > 2 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllComments(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Read more */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Read more</h3>
                <div className="space-y-4">
                  {Object.values(mockNewsData).filter(n => n.slug !== news.slug).slice(0, 4).map((article) => (
                    <div key={article.id} className="flex gap-3 border-b-2 border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <Image
                          src={article.image}
                          alt={article.title}
                          width={80}
                          height={60}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#198639] transition-colors mb-1">
                          <Link href={`/tin-tuc/p-${article.slug}`}>
                            {article.title}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>42 comments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span>15 reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get bonuses section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Don&apos;t miss your chance to get free giftcode</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Get bonuses, giftcodes and attractive gifts.
                  </p>
                  
                  {/* Email and Register */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#a56b00]"
                    />
                    <button className="px-4 py-2 bg-[#a56b00] text-white rounded-md hover:opacity-90 transition-opacity font-medium text-sm">
                      Register
                    </button>
                  </div>
                  
                  {/* Or divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[1px] bg-gray-300"></div>
                    <span className="text-xs text-gray-500">or</span>
                    <div className="flex-1 h-[1px] bg-gray-300"></div>
                  </div>
                  
                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-xs">Google</span>
                    </button>
                    
                    <button className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-xs">Facebook</span>
                    </button>
                    
                    <button className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span className="text-xs">Apple</span>
                    </button>
                  </div>
                </div>
              </div>            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}