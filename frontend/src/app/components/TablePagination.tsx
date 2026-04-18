type PaginationToken = number | "ellipsis";

const baseButtonClass = "px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";
const activeButtonClass = "px-3 py-1 text-sm rounded-md bg-[#1F6B7A] text-white hover:bg-[#176059]";
const pageButtonClass = "px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50";

type TablePaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPageTokens(currentPage: number, totalPages: number): PaginationToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PaginationToken[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis");
  }

  tokens.push(totalPages);
  return tokens;
}

export function TablePagination({ currentPage, totalItems, pageSize, itemLabel, onPageChange, className }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(totalItems, safeCurrentPage * pageSize);
  const pageTokens = buildPageTokens(safeCurrentPage, totalPages);

  return (
    <div className={`flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}>
      <p className="text-sm text-gray-600">
        Menampilkan {startItem}-{endItem} dari {totalItems} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={baseButtonClass} onClick={() => onPageChange(safeCurrentPage - 1)} disabled={safeCurrentPage <= 1 || totalItems === 0}>
          Previous
        </button>

        {pageTokens.map((token, index) => {
          if (token === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-500" aria-hidden="true">
                ...
              </span>
            );
          }

          const isActive = token === safeCurrentPage;

          return (
            <button
              key={token}
              type="button"
              className={isActive ? activeButtonClass : pageButtonClass}
              onClick={() => onPageChange(token)}
              aria-current={isActive ? "page" : undefined}
            >
              {token}
            </button>
          );
        })}

        <button type="button" className={baseButtonClass} onClick={() => onPageChange(safeCurrentPage + 1)} disabled={safeCurrentPage >= totalPages || totalItems === 0}>
          Next
        </button>
      </div>
    </div>
  );
}
