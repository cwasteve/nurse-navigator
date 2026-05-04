import { ListChecks } from 'lucide-react';
import { STATUS } from '../constants/status';
import { useMatchDataCtx, useMatchFilterCtx, useAppCtx } from '../contexts';

const { UNREVIEWED } = STATUS;
import Header from './Header';
import SearchBar from './SearchBar';
import Button from './Button';
import Tabs from './Tabs';
import MatchTable from './MatchTable';
import CompareModal from './CompareModal';
import RejectDialog from './RejectDialog';
import NoteDialog from './NoteDialog';
import QuickReviewModal from './QuickReviewModal';
import ConfidenceRangeSelector from './ConfidenceRangeSelector';
import UndoToast from './UndoToast';

export default function AppLayout() {
  const { matchRecords, isLoading } = useMatchDataCtx();
  const {
    search,
    setSearch,
    activeTab,
    tabFiltered,
    selectedIds,
    openQuickReview,
    clearSelection,
    selectByRange,
    quickReviewOpen,
  } = useMatchFilterCtx();
  const { compareRecord, searchSuggestions, handleSelectSuggestion, handleTabChange, noteDialogRecord } = useAppCtx();
  const { stats } = useMatchDataCtx();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      {/* Toolbar */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            suggestions={searchSuggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
          <span className="text-sm text-neutral-400">
            {tabFiltered.length} of {matchRecords.length} matches
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={stats}
          />
        </div>
      </div>

      {/* Selection Toolbar — always visible on unreviewed tab */}
      {activeTab === UNREVIEWED && (
        <div
          className={`border-b px-6 py-2.5 ${selectedIds.size > 0 ? 'bg-primary-bg border-primary/20' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {selectedIds.size > 0 ? (
              <>
                <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openQuickReview}>
                  <ListChecks className="w-3.5 h-3.5" />
                  Quick Review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}>
                  Clear Selection
                </Button>
              </>
            ) : (
              <span className="text-sm text-neutral-500">
                Select matches using checkboxes or by confidence level to Quick Review in bulk
              </span>
            )}
            <div className="ml-auto">
              <ConfidenceRangeSelector onSelect={selectByRange} />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <main className="flex-1 px-6 py-4">
        <MatchTable />
      </main>

      {/* Compare Modal */}
      {compareRecord && <CompareModal />}

      {/* Reject Dialog */}
      <RejectDialog />

      {/* Note Dialog */}
      {noteDialogRecord && <NoteDialog />}

      {/* Quick Review Modal */}
      {quickReviewOpen && <QuickReviewModal />}

      {/* Undo Toasts */}
      <UndoToast />
    </div>
  );
}
