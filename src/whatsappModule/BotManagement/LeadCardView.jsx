import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import {
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const LeadCardView = ({ leads }) => {
  const navigate = useNavigate();

  // Get card border color based on budget (similar to Kanban view)
  const getLeadCardBorderColor = (lead) => {
    const budget = Number(lead.budget || 0);

    if (budget > 5000) return "border-l-red-500";
    if (budget > 2000) return "border-l-yellow-500";
    return "border-l-green-500";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "proposal":
        return "bg-yellow-100 text-yellow-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "booked":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to convert tags string to array
  const getTagsArray = (tagsString) => {
    if (!tagsString) return [];
    return tagsString.split(",").map((tag) => tag.trim());
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-users"></i>
        <h4>No leads found</h4>
        <p>No leads associated with this phone number</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Card
          key={lead._id}
          className={`border-l-4 ${getLeadCardBorderColor(
            lead
          )} cursor-pointer hover:bg-gray-50 transition-colors`}
          onClick={() => navigate(`/crm/leads/${lead._id}`)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-muted-foreground">
                  {lead.destination && `Trip to ${lead.destination}`}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`ml-2 ${getStatusColor(lead.status)}`}
              >
                {lead.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 text-xs space-y-2">
            {/* Contact Info */}
            <div className="space-y-1">
              {lead.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            {/* Budget */}
            {lead.budget && (
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Budget:</span>
                <span className="font-medium">
                  ${Number(lead.budget).toLocaleString()}
                </span>
              </div>
            )}

            {/* Travel Dates */}
            {lead.travelStartDate && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>
                  {lead.travelStartDate}
                  {lead.travelEndDate && ` - ${lead.travelEndDate}`}
                </span>
              </div>
            )}

            {/* Tags */}
            {getTagsArray(lead.tags).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {getTagsArray(lead.tags)
                  .slice(0, 3)
                  .map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                {getTagsArray(lead.tags).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{getTagsArray(lead.tags).length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="p-2 flex justify-between">
            <span className="text-xs text-muted-foreground">
              Source: {lead.source}
            </span>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle message action
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="sr-only">Message</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle call action
                  if (lead.phone) {
                    window.location.href = `tel:${lead.phone}`;
                  }
                }}
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="sr-only">Call</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle email action
                  if (lead.email) {
                    window.location.href = `mailto:${lead.email}`;
                  }
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="sr-only">Email</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/crm/leads/${lead._id}`);
                    }}
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/crm/leads/edit/${lead._id}`);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default LeadCardView;
