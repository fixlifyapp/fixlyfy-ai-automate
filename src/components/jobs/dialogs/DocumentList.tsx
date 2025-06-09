
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Send, 
  ArrowRight, 
  Trash2,
  FileText,
  Receipt,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Document {
  id: string;
  number: string;
  type: 'estimate' | 'invoice';
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'approved' | 'rejected';
  createdDate: string;
  clientId: string;
}

interface DocumentListProps {
  onViewDocument?: (document: Document) => void;
  onEditDocument?: (document: Document) => void;
  onSendDocument?: (document: Document) => void;
  onConvertDocument?: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
}

export const DocumentList = ({
  onViewDocument,
  onEditDocument,
  onSendDocument,
  onConvertDocument,
  onDeleteDocument
}: DocumentListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'estimate' | 'invoice'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Mock data
  const documents: Document[] = [
    {
      id: '1',
      number: 'EST-001',
      type: 'estimate',
      clientName: 'John Smith',
      amount: 450.00,
      status: 'sent',
      createdDate: '2024-01-15',
      clientId: 'client-1'
    },
    {
      id: '2',
      number: 'INV-001',
      type: 'invoice',
      clientName: 'Sarah Johnson',
      amount: 750.00,
      status: 'paid',
      createdDate: '2024-01-14',
      clientId: 'client-2'
    },
    {
      id: '3',
      number: 'EST-002',
      type: 'estimate',
      clientName: 'Mike Wilson',
      amount: 320.00,
      status: 'draft',
      createdDate: '2024-01-13',
      clientId: 'client-3'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConvertAction = (doc: Document) => {
    if (doc.type === 'estimate' && doc.status === 'approved') {
      return { label: 'Convert to Invoice', icon: ArrowRight };
    }
    if (doc.type === 'invoice' && doc.status === 'sent') {
      return { label: 'Record Payment', icon: DollarSign };
    }
    return null;
  };

  const handleDeleteConfirm = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc && onDeleteDocument) {
      onDeleteDocument(doc);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            Documents
          </h2>
        </div>

        {/* Search and Filters */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className={isMobile ? 'text-sm px-3' : ''}
            >
              All
            </Button>
            <Button
              variant={filterType === 'estimate' ? 'default' : 'outline'}
              onClick={() => setFilterType('estimate')}
              className={isMobile ? 'text-sm px-3' : ''}
            >
              <FileText className="h-4 w-4 mr-1" />
              Estimates
            </Button>
            <Button
              variant={filterType === 'invoice' ? 'default' : 'outline'}
              onClick={() => setFilterType('invoice')}
              className={isMobile ? 'text-sm px-3' : ''}
            >
              <Receipt className="h-4 w-4 mr-1" />
              Invoices
            </Button>
          </div>
        </div>
      </div>

      {/* Document Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredDocuments.map((document) => {
          const convertAction = getConvertAction(document);
          
          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${document.type === 'estimate' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {document.type === 'estimate' ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Receipt className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
                        {document.number}
                      </CardTitle>
                      <p className={`text-muted-foreground capitalize ${isMobile ? 'text-sm' : ''}`}>
                        {document.type}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(document.status)} ${isMobile ? 'text-xs' : ''}`}>
                    {document.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className={isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                      {document.clientName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className={`font-bold text-primary ${isMobile ? 'text-base' : 'text-lg'}`}>
                      {formatCurrency(document.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                      {new Date(document.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`mt-4 grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDocument?.(document)}
                    className={isMobile ? 'text-xs' : ''}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditDocument?.(document)}
                    className={isMobile ? 'text-xs' : ''}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  {document.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendDocument?.(document)}
                      className={isMobile ? 'text-xs' : ''}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  )}
                  
                  {convertAction && (
                    <Button
                      size="sm"
                      onClick={() => onConvertDocument?.(document)}
                      className={isMobile ? 'text-xs' : ''}
                    >
                      <convertAction.icon className="h-3 w-3 mr-1" />
                      {isMobile ? convertAction.label.split(' ')[0] : convertAction.label}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(document.id)}
                    className={`text-red-600 hover:text-red-700 ${isMobile ? 'text-xs' : ''}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mb-4">
              {filterType === 'estimate' ? (
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
              ) : filterType === 'invoice' ? (
                <Receipt className="h-12 w-12 mx-auto text-gray-400" />
              ) : (
                <Search className="h-12 w-12 mx-auto text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No documents found' : `No ${filterType === 'all' ? 'documents' : filterType + 's'} yet`}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : `${filterType === 'all' ? 'Documents' : filterType + 's'} will appear here when created`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Are you sure you want to delete this document? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
