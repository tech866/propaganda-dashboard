'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2,
  X,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { 
  Client, 
  getClientStatusColor,
  getClientStatusIcon,
  getIndustryIcon,
  formatCurrency,
  formatDate
} from '@/lib/services/clientService';

interface ClientDetailsProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ClientDetails({ client, onEdit, onDelete, onClose }: ClientDetailsProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {client.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-2xl">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                    <CardDescription className="text-lg">{client.company}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={getClientStatusColor(client.status)}
                      >
                        {getClientStatusIcon(client.status)} {client.status}
                      </Badge>
                      {client.industry && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getIndustryIcon(client.industry)} {client.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.contact_person && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Contact Person</p>
                        <p className="text-sm text-muted-foreground">{client.contact_person}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {client.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                      </div>
                    </div>
                  )}

                  {client.industry && (
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Industry</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {getIndustryIcon(client.industry)} {client.industry}
                        </p>
                      </div>
                    </div>
                  )}

                  {client.monthly_budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Monthly Budget</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {formatCurrency(client.monthly_budget)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          {(client.billing_address || client.billing_city || client.billing_state || client.billing_zip) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.billing_address && (
                    <p className="text-sm">{client.billing_address}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {client.billing_city && <span>{client.billing_city}</span>}
                    {client.billing_city && client.billing_state && <span>,</span>}
                    {client.billing_state && <span>{client.billing_state}</span>}
                    {client.billing_zip && <span>{client.billing_zip}</span>}
                  </div>
                  {client.billing_country && (
                    <p className="text-sm text-muted-foreground">{client.billing_country}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract Information */}
          {(client.contract_start_date || client.contract_end_date) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Contract Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.contract_start_date && (
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(client.contract_start_date)}
                      </p>
                    </div>
                  )}
                  {client.contract_end_date && (
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(client.contract_end_date)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Account Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(client.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline">Created</Badge>
                </div>
                
                {client.updated_at !== client.created_at && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(client.updated_at)}
                      </p>
                    </div>
                    <Badge variant="outline">Updated</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Campaigns
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Performance
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}