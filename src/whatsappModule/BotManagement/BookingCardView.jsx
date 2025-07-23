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
  Calendar,
  CreditCard,
  MoreHorizontal,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const BookingCardView = ({ bookings }) => {
  const navigate = useNavigate();

  // Get card border color based on booking value
  const getBookingCardBorderColor = (booking) => {
    const value = Number(booking.value || 0);

    if (value > 100000) return "border-l-red-500";
    if (value > 50000) return "border-l-yellow-500";
    return "border-l-green-500";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-calendar-alt"></i>
        <h4>No bookings found</h4>
        <p>No bookings associated with this phone number</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card
          key={booking._id}
          className={`border-l-4 ${getBookingCardBorderColor(
            booking
          )} cursor-pointer hover:bg-gray-50 transition-colors`}
          onClick={() => navigate(`/crm/bookings/${booking._id}/view`)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">
                  {booking.itineraryName || "Booking"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.client}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`ml-2 ${getStatusColor(booking.status)}`}
              >
                {booking.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 text-xs space-y-2">
            {/* Travel Dates */}
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>
                {formatDate(booking.itineraryStartDate)}
                {booking.itineraryEndDate &&
                  ` - ${formatDate(booking.itineraryEndDate)}`}
              </span>
            </div>

            {/* Booking Value */}
            <div className="flex items-center">
              <CreditCard className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground mr-1">Value:</span>
              <span className="font-medium">
                ₹{Number(booking.value).toLocaleString()}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">Payment:</span>
              <span className="font-medium">
                {booking.paymentCompletionPercent}% complete
              </span>
            </div>

            {/* Destination if available */}
            {booking.lead?.destination && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{booking.lead.destination}</span>
              </div>
            )}

            {/* Description if available */}
            {booking.itineraryDescription && (
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="truncate">{booking.itineraryDescription}</span>
              </div>
            )}

            {/* Payments */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Payments</div>
                <div className="space-y-1">
                  {booking.payments.slice(0, 2).map((payment) => (
                    <div
                      key={payment._id}
                      className="flex justify-between items-center text-xs bg-gray-50 p-1 rounded"
                    >
                      <span>{payment.name}</span>
                      <div className="flex items-center">
                        <span>₹{payment.amount.toLocaleString()}</span>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-[10px] ${
                            payment.isPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {booking.payments.length > 2 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{booking.payments.length - 2} more payments
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="p-2 flex justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span>
                Lead: {booking.lead?.name || "Unknown"}
              </span>
            </div>
            <div className="flex space-x-1">
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
                      navigate(`/crm/bookings/${booking._id}`);
                    }}
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/crm/bookings/edit/${booking._id}`);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (booking.lead?._id) {
                        navigate(`/crm/leads/${booking.lead._id}`);
                      }
                    }}
                  >
                    View Lead
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

export default BookingCardView;
