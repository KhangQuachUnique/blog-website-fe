# GenericTable - Reusable Table Component

## Tổng Quan

`GenericTable` là một component bảng tổng quát, tái sử dụng được cho mọi loại dữ liệu (posts, users, reports, v.v.). Nó duy trì thiết kế giao diện của Bloogie và hỗ trợ custom rendering, actions, và styling.

## Kiến Trúc

```
src/
  components/PostsTable/
    ├── GenericTable.tsx       # Core table component
    └── PostsTable.tsx         # Wrapper example for blog posts
  types/
    ├── table.ts               # Table interfaces & colors
    └── post.ts                # Post-specific types
```

## Các Kiểu Dữ Liệu

### ITableRow (Bắt buộc)
Mọi data type phải extend `ITableRow`:

```typescript
interface ITableRow {
  id: number | string;
}
```

### TableColumn<T>
Định nghĩa cấu trúc cột:

```typescript
interface TableColumn<T extends ITableRow> {
  id: keyof T;              // Khóa field của object
  label: string;            // Tiêu đề cột
  width?: string;           // CSS width (ví dụ: '80px', '25%')
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;       // Cho phép sắp xếp (future)
  searchable?: boolean;     // Cho phép tìm kiếm (future)
  render?: (row: T) => ReactNode;  // Custom render
}
```

### TableAction<T>
Định nghĩa action buttons:

```typescript
interface TableAction<T extends ITableRow> {
  id: string;
  label?: string;
  icon?: string | ((row: T) => ReactNode);  // Emoji hoặc ReactNode
  tooltip?: string;
  visible?: (row: T) => boolean;            // Điều kiện hiển thị
  disabled?: (row: T) => boolean;           // Điều kiện disable
  onClick: (row: T) => void | Promise<void>;
}
```

## Sử Dụng GenericTable Trực Tiếp

### Ví Dụ 1: Bảng Users

```typescript
import GenericTable from '@/components/PostsTable/GenericTable';
import type { TableColumn, TableAction } from '@/types/table';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  const columns: TableColumn<User>[] = [
    {
      id: 'id',
      label: 'ID',
      width: '80px',
      render: (user) => <strong>#{user.id}</strong>,
    },
    {
      id: 'name',
      label: 'Tên',
      align: 'left',
    },
    {
      id: 'email',
      label: 'Email',
      align: 'left',
      render: (user) => (
        <a href={`mailto:${user.email}`}>{user.email}</a>
      ),
    },
    {
      id: 'role',
      label: 'Vai trò',
      align: 'center',
      render: (user) => (
        <span style={{
          backgroundColor: user.role === 'ADMIN' ? '#fca5a5' : '#bfdbfe',
          color: user.role === 'ADMIN' ? '#7f1d1d' : '#1e40af',
          padding: '4px 12px',
          borderRadius: '16px',
        }}>
          {user.role}
        </span>
      ),
    },
  ];

  const actions: TableAction<User>[] = [
    {
      id: 'edit',
      icon: '✏️',
      tooltip: 'Chỉnh sửa',
      onClick: (user) => console.log('Edit', user.id),
    },
    {
      id: 'delete',
      icon: '🗑️',
      tooltip: 'Xóa',
      onClick: async (user) => {
        await deleteUser(user.id);
      },
    },
  ];

  return (
    <GenericTable
      data={users}
      columns={columns}
      actions={actions}
      emptyMessage="Không có người dùng nào"
    />
  );
};
```

### Ví Dụ 2: Bảng Reports

```typescript
interface Report {
  id: number;
  type: 'USER' | 'POST' | 'COMMENT';
  reason: string;
  createdAt: string;
}

const columns: TableColumn<Report>[] = [
  {
    id: 'id',
    label: 'ID',
    width: '80px',
  },
  {
    id: 'type',
    label: 'Loại',
    render: (report) => {
      const colors: Record<string, { bg: string; text: string }> = {
        USER: { bg: '#ffe4e6', text: '#be185d' },
        POST: { bg: '#e0e7ff', text: '#3730a3' },
        COMMENT: { bg: '#fef3c7', text: '#b45309' },
      };
      const color = colors[report.type];
      return (
        <span style={{
          backgroundColor: color.bg,
          color: color.text,
          padding: '4px 12px',
          borderRadius: '16px',
        }}>
          {report.type}
        </span>
      );
    },
  },
  {
    id: 'reason',
    label: 'Lý do',
    align: 'left',
  },
  {
    id: 'createdAt',
    label: 'Thời gian',
    render: (report) =>
      new Date(report.createdAt).toLocaleString('vi-VN'),
  },
];

const actions: TableAction<Report>[] = [
  {
    id: 'delete',
    icon: '🗑️',
    tooltip: 'Xóa report',
    onClick: (report) => deleteReport(report.id),
  },
];

return (
  <GenericTable
    data={reports}
    columns={columns}
    actions={actions}
    emptyMessage="Không có report"
  />
);
```

## Sử Dụng PostsTable (Wrapper)

`PostsTable` là một wrapper xung quanh `GenericTable` cấu hình cho blog posts. Nó duy trì tương thích ngược với code cũ:

```typescript
import PostsTable from '@/components/PostsTable/PostsTable';
import type { BlogPost } from '@/types/post';

const PostListPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleHide = async (postId: number) => {
    setLoadingId(postId);
    try {
      await fetch(`/api/blog-posts/${postId}/hide`, { method: 'PATCH' });
      // Update posts state
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <PostsTable
      posts={posts}
      onHide={handleHide}
      onRestore={handleRestore}
      loadingId={loadingId}
      emptyMessage="Không có bài viết"
    />
  );
};
```

## Bloogie Color Palette

Sử dụng `BLOOGIE_COLORS` từ `src/types/table.ts`:

```typescript
import { BLOOGIE_COLORS } from '@/types/table';

const colors = {
  primary: '#8c1d35',           // Màu chính Bloogie
  accent: '#fce7f3',            // Màu accent (header bg)
  background: '#ffffff',        // Màu nền bảng
  backgroundAlt: '#fffbfc',     // Màu nền thay thế (alternating rows)
  backgroundHover: '#faf5f7',   // Màu hover
  text: '#111827',              // Màu text chính
  textSecondary: '#4b5563',     // Màu text phụ
  border: '#cbd5e1',            // Màu border
  statusActive: { ... },        // Status colors
  statusHidden: { ... },
  statusDraft: { ... },
};

// Sử dụng:
<Box sx={{ color: BLOOGIE_COLORS.primary }}>
  Text với Bloogie color
</Box>
```

## Props

### GenericTable Props

```typescript
interface GenericTableProps<T extends ITableRow> {
  data: T[];                              // Array dữ liệu
  columns: TableColumn<T>[];              // Cấu hình cột
  actions?: TableAction<T>[];             // Actions (optional)
  emptyMessage?: string;                  // Message khi rỗng
  loading?: boolean;                      // Loading state (future)
}
```

## Features

✅ **Tái Sử Dụng**: Hoạt động với bất kỳ data type nào extend `ITableRow`  
✅ **Custom Rendering**: Mỗi cell có thể render tùy chỉnh via `render` prop  
✅ **Flexible Actions**: Buttons với icon, label, visibility, disabled conditions  
✅ **Bloogie Design**: Màu sắc và styling khớp với Bloogie theme  
✅ **Responsive**: Hỗ trợ table cell truncation và flexbox layout  
🔜 **Sort & Search**: Infrastructure sẵn sàng (future implementation)  

## Migration từ Custom Tables

Nếu bạn có custom table khác (ví dụ `UsersTable`, `ReportsTable`), bạn có thể:

1. **Tạo wrapper**: Như `PostsTable.tsx` - tạo component wrapper mỏng
2. **Hoặc sử dụng trực tiếp**: Render `GenericTable` với cấu hình cột/action inline

**Ưu điểm Wrapper Pattern**:
- Dễ bảo trì (logic cấu hình tập trung)
- Dễ reuse (nhập & sử dụng)
- Tương thích ngược (giữ existing props interface)

## Ví Dụ Advanced

### Custom Status Badge

```typescript
const columns: TableColumn<Post>[] = [
  {
    id: 'status',
    label: 'Status',
    render: (post) => {
      const statusMap = {
        ACTIVE: { icon: '✓', color: '#059669', bg: '#d1fae5' },
        HIDDEN: { icon: '👁️', color: '#475569', bg: '#e2e8f0' },
        DRAFT: { icon: '✎', color: '#b45309', bg: '#fef3c7' },
      };
      const status = statusMap[post.status];
      return (
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: status.bg,
          color: status.color,
          padding: '6px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}>
          <span>{status.icon}</span>
          {post.status}
        </Box>
      );
    },
  },
];
```

### Conditional Actions

```typescript
const actions: TableAction<User>[] = [
  {
    id: 'promote-demote',
    icon: (user) => user.role === 'USER' ? '⬆️' : '⬇️',
    tooltip: (user) => user.role === 'USER' ? 'Promote to Admin' : 'Demote to User',
    visible: (user) => user.id !== currentUserId,
    disabled: (user) => user.isBanned,
    onClick: (user) => promoteUser(user.id),
  },
];
```

## Best Practices

1. **Giữ `columns` và `actions` stable**: Dùng `useMemo` nếu chúng phụ thuộc vào state
2. **Custom `render`**: Chỉ dùng để format/style, logic chính để ở component cha
3. **Actions callbacks**: Giữ nhỏ, delegate complex logic đến service/API
4. **Empty Message**: Cung cấp message có ý nghĩa theo context
5. **Type Safety**: Luôn dùng TypeScript generics cho data type của bạn

## Troubleshooting

**Q: Làm sao thêm sort/search?**  
A: Các interfaces đã có `sortable` và `searchable` properties. Chỉ cần implement logic sorting/filtering trong parent component.

**Q: Làm sao custom styling?**  
A: Sử dụng `render` prop để render custom JSX với MUI `sx` props hoặc CSS modules.

**Q: Làm sao use with React Query?**  
A: Pass query results vào `data` prop, handle refetch/mutations ở component cha.

---

**File References**:
- GenericTable: `src/components/PostsTable/GenericTable.tsx`
- PostsTable Wrapper: `src/components/PostsTable/PostsTable.tsx`
- Types: `src/types/table.ts`
- Post Types: `src/types/post.ts`
