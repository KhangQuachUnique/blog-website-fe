# 🎯 Frontend User Reactions - Migration Guide

## 📦 Files Updated

### ✅ Services
- `src/services/user/reactions/reactionService.ts` - **REFACTORED**
  - New DTOs matching backend
  - New API functions
  - Backward compatibility layer

### ✅ Hooks  
- `src/hooks/usePostReactions.ts` - **UPDATED** (legacy, still works)
- `src/hooks/useReactions.ts` - **NEW** (React Query, recommended)

---

## 🔄 What Changed?

### Backend Changes
1. **No more `type` column** - Post/Comment determined by nullable fields
2. **New unique constraints** - `(user, post, emoji)` và `(user, comment, emoji)`
3. **Toggle behavior** - Discord-style: click = react, click again = unreact
4. **New endpoints**:
   - `POST /user-reacts/posts/toggle`
   - `POST /user-reacts/comments/toggle`
   - `GET /user-reacts/posts/:postId`
   - `GET /user-reacts/comments/:commentId`

### Frontend Changes
1. **New DTOs**:
   ```ts
   ToggleReactDto
   EmojiSummary
   UserReactSummary
   ```

2. **New API functions**:
   ```ts
   togglePostReact(dto)
   toggleCommentReact(dto)
   getPostReactions(postId, userId?)
   getCommentReactions(commentId, userId?)
   getPostReactionsBatch(postIds[], userId?)
   ```

3. **New React Query hooks** (recommended):
   ```ts
   usePostReactions(postId)
   useTogglePostReact(postId)
   useCommentReactions(commentId)
   useToggleCommentReact(commentId)
   ```

---

## 🚀 Migration Examples

### Example 1: Using New React Query Hooks (Recommended)

```tsx
import { usePostReactions, useTogglePostReact } from '../hooks/useReactions';

function PostCard({ postId }: { postId: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Query reactions
  const { data, isLoading } = usePostReactions(postId);

  // Mutation to toggle
  const { mutate: toggleReact, isPending } = useTogglePostReact(postId);

  const handleEmojiClick = (emojiId: number) => {
    if (!user) {
      showToast({ type: 'info', message: 'Vui lòng đăng nhập' });
      return;
    }

    toggleReact(
      { userId: user.id, emojiId },
      {
        onSuccess: () => {
          showToast({ type: 'success', message: 'React thành công!' });
        },
        onError: () => {
          showToast({ type: 'error', message: 'Lỗi khi react' });
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.emojis.map((emoji) => (
        <button
          key={emoji.emojiId}
          onClick={() => handleEmojiClick(emoji.emojiId)}
          disabled={isPending}
          style={{
            border: emoji.reactedByCurrentUser ? '2px solid #F295B6' : 'none',
          }}
        >
          {emoji.type === 'unicode' && emoji.codepoint
            ? String.fromCodePoint(parseInt(emoji.codepoint, 16))
            : <img src={emoji.emojiUrl} alt="emoji" />
          }
          <span>{emoji.totalCount}</span>
        </button>
      ))}
    </div>
  );
}
```

### Example 2: Using Legacy Hook (Still Works)

```tsx
import { usePostReactions } from '../hooks/usePostReactions';

function PostCard({ postId }: { postId: number }) {
  const {
    reactions,
    isLoading,
    isReacting,
    handleReactionClick,
  } = usePostReactions({ postId });

  return (
    <div>
      {reactions.map((reaction) => (
        <button
          key={reaction.emojiId}
          onClick={() => handleReactionClick(reaction.emojiId)}
          disabled={isReacting}
        >
          {/* ... */}
        </button>
      ))}
    </div>
  );
}
```

### Example 3: Direct API Calls

```tsx
import { togglePostReact, getPostReactions } from '../services/user/reactions/reactionService';

async function handleReact(userId: number, postId: number, emojiId: number) {
  try {
    // Toggle reaction
    await togglePostReact({ userId, postId, emojiId });

    // Refetch reactions
    const reactions = await getPostReactions(postId, userId);
    console.log(reactions.emojis);
  } catch (error) {
    console.error('Failed to react:', error);
  }
}
```

---

## 📊 Type Mapping

### Old → New

| Old Type | New Type | Notes |
|----------|----------|-------|
| `EmojiReaction` | `EmojiSummary` | Renamed, structure similar |
| `EmojiBarResponse` | `UserReactSummary` | More descriptive name |
| `ReactRequest` | `ToggleReactDto` | Simpler, matches backend |
| `icon` | `codepoint` / `emojiUrl` | Split into 2 fields |
| `count` | `totalCount` | More descriptive |
| `is_reacted_by_me` | `reactedByCurrentUser` | camelCase |
| `emoji_id` | `emojiId` | camelCase |

### Field Mapping

```ts
// OLD
interface EmojiReaction {
  type: 'unicode' | 'custom';
  icon: string;                    // "😄" or "https://..."
  count: number;
  is_reacted_by_me: boolean;
  emoji_id: number;
}

// NEW
interface EmojiSummary {
  emojiId: number;
  type: 'unicode' | 'custom';
  codepoint?: string;              // "1f604" (unicode only)
  emojiUrl?: string;               // "https://..." (custom only)
  totalCount: number;
  reactedByCurrentUser: boolean;
}
```

---

## ⚡ Performance Improvements

### 1. React Query Benefits
- **Automatic caching** - No duplicate requests
- **Optimistic updates** - Instant UI feedback
- **Background refetching** - Always fresh data
- **Query invalidation** - Auto sync across components

### 2. Batch Queries (Newsfeed)
```ts
import { getPostReactionsBatch } from '../services/user/reactions/reactionService';

// OLD: N queries
for (const post of posts) {
  await getPostReactions(post.id, userId); // ❌ N requests
}

// NEW: 1 query
const postIds = posts.map(p => p.id);
const reactionsMap = await getPostReactionsBatch(postIds, userId); // ✅ 1 request

posts.forEach(post => {
  const reactions = reactionsMap[post.id];
  // ...
});
```

---

## 🔧 Backward Compatibility

### Deprecated Functions (Still Work)

```ts
// ⚠️ Deprecated - Use togglePostReact() instead
reactWithEmoji(data) 

// ⚠️ Deprecated - Use getPostReactions() or getCommentReactions() instead
getEmojiBar(targetType, targetId, userId)
```

These functions still work but will show TypeScript warnings. They internally use the new API.

---

## 🎯 Best Practices

### 1. Use React Query Hooks
```ts
// ✅ GOOD - Automatic caching, refetching
const { data, isLoading } = usePostReactions(postId);
const { mutate } = useTogglePostReact(postId);

// ❌ AVOID - Manual state management
const [reactions, setReactions] = useState([]);
useEffect(() => { /* fetch */ }, []);
```

### 2. Handle Loading States
```tsx
if (isLoading) return <Skeleton />;
if (!data) return null;

return <EmojiBar emojis={data.emojis} />;
```

### 3. Optimistic Updates
React Query handles this automatically! UI updates instantly, rolls back on error.

### 4. Error Handling
```ts
const { mutate } = useTogglePostReact(postId);

mutate(
  { userId, emojiId },
  {
    onError: (error) => {
      showToast({ type: 'error', message: 'Failed to react' });
    },
  }
);
```

---

## 🐛 Common Issues

### Issue 1: "Cannot read property 'reactions'"
**Cause**: Using old `EmojiBarResponse` type
```ts
// ❌ OLD
const data: EmojiBarResponse = await getEmojiBar(...);
data.reactions // ❌

// ✅ NEW
const data: UserReactSummary = await getPostReactions(...);
data.emojis // ✅
```

### Issue 2: "Icon is undefined"
**Cause**: Using old `icon` field
```tsx
// ❌ OLD
{emoji.icon}

// ✅ NEW
{emoji.type === 'unicode' && emoji.codepoint
  ? String.fromCodePoint(parseInt(emoji.codepoint, 16))
  : <img src={emoji.emojiUrl} />
}
```

### Issue 3: "Reactions not updating"
**Cause**: Not invalidating cache
```ts
// ✅ Use React Query mutation hooks (auto invalidate)
const { mutate } = useTogglePostReact(postId);

// ❌ Or manually invalidate
await togglePostReact(dto);
queryClient.invalidateQueries(['reactions', 'post', postId]);
```

---

## 📝 Summary

✅ **Benefits**:
- Clean architecture matching backend
- React Query integration (caching, optimistic updates)
- Batch queries for performance
- Type-safe with TypeScript
- Backward compatible

🔄 **Migration Path**:
1. **Phase 1** (Now): Old hooks still work, use new types
2. **Phase 2** (Next): Migrate to React Query hooks gradually
3. **Phase 3** (Future): Remove deprecated functions

🚀 **Recommended**: Use new React Query hooks (`useReactions.ts`) for new code!
