import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ITableRow, TableColumn, TableAction } from '../../types/table';
import { BLOOGIE_COLORS } from '../../types/table';

interface GenericTableProps<T extends ITableRow> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  emptyMessage?: string;
  loading?: boolean;
}

/**
 * GenericTable - A reusable table component supporting any data type
 * Maintains Bloogie design language and supports custom rendering and actions
 */
const GenericTable = React.forwardRef<HTMLDivElement, GenericTableProps<any>>(
  (
    {
      data,
      columns,
      actions = [],
      emptyMessage = 'Không có dữ liệu',
      loading = false,
    },
    ref
  ) => {
    // Empty state
    if (!loading && (!data || data.length === 0)) {
      return (
        <Paper
          ref={ref}
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: '16px',
            border: `2px solid ${BLOOGIE_COLORS.accent}`,
            backgroundColor: BLOOGIE_COLORS.background,
          }}
        >
          <Box sx={{ fontSize: '48px', mb: 2 }}>📭</Box>
          <Box sx={{ color: BLOOGIE_COLORS.textSecondary, fontWeight: '600' }}>
            {emptyMessage}
          </Box>
        </Paper>
      );
    }

    // Table render
    return (
      <TableContainer
        ref={ref}
        component={Paper}
        sx={{
          borderRadius: '16px',
          border: `2px solid ${BLOOGIE_COLORS.accent}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
          {/* Header */}
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: BLOOGIE_COLORS.accent,
                '& th': {
                  color: BLOOGIE_COLORS.primary,
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                },
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  align={col.align || 'left'}
                  sx={{ width: col.width }}
                >
                  {col.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" sx={{ width: '120px' }}>
                  Hành động
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody
            sx={{
              '& tr:hover': {
                backgroundColor: BLOOGIE_COLORS.backgroundHover,
                transition: 'background-color 0.2s ease-in-out',
              },
              '& tr:nth-of-type(odd)': {
                backgroundColor: BLOOGIE_COLORS.background,
              },
              '& tr:nth-of-type(even)': {
                backgroundColor: BLOOGIE_COLORS.backgroundAlt,
              },
            }}
          >
            {data.map((row, idx) => (
              <TableRow key={`${row.id}-${idx}`}>
                {columns.map((col) => {
                  const value = row[col.id as keyof typeof row];
                  return (
                    <TableCell
                      key={`${row.id}-${String(col.id)}`}
                      align={col.align || 'left'}
                      sx={{
                        fontSize: '14px',
                        color: BLOOGIE_COLORS.text,
                        px: 3,
                        py: 2,
                        verticalAlign: 'middle',
                        maxWidth: col.width === undefined ? '300px' : 'auto',
                      }}
                    >
                      {col.render ? col.render(row) : String(value)}
                    </TableCell>
                  );
                })}
                {actions.length > 0 && (
                  <TableCell
                    align="center"
                    sx={{
                      px: 2,
                      py: 2,
                      verticalAlign: 'middle',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {actions
                        .filter((action) => !action.visible || action.visible(row))
                        .map((action) => (
                          <Box
                            key={action.id}
                            component="button"
                            onClick={() => action.onClick(row)}
                            disabled={action.disabled?.(row) || false}
                            title={action.tooltip}
                            sx={{
                              padding: '8px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: action.disabled?.(row) ? 'not-allowed' : 'pointer',
                              opacity: action.disabled?.(row) ? 0.5 : 1,
                              transition: 'all 0.2s',
                              background: 'transparent',
                              fontSize: typeof action.icon === 'string' ? '16px' : 'inherit',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              '&:hover:not(:disabled)': {
                                opacity: 0.8,
                              },
                            }}
                          >
                            {typeof action.icon === 'string' ? action.icon : action.icon?.(row)}
                            {action.label && <span>{action.label}</span>}
                          </Box>
                        ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

GenericTable.displayName = 'GenericTable';

export default GenericTable;
