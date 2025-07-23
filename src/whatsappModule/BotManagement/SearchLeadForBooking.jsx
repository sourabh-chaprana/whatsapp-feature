import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { getAllLeadsWithSearchFilter } from "../../store/slices/leads/leadThunk";
import { formatCurrency } from "../../utils/currencyFunc";
// import { formatName, formatStatus } from "../../utils/textUtils";
import { formatName } from "../../utils/textUtils";
import { formatDate } from "../../utils/bookingUtils";
import { format } from "date-fns";

const SearchLeadForBooking = ({
  isOpen,
  onClose,
  phoneNumber,
  onSelectLead,
  openMenuId
}) => {
  const dispatch = useDispatch();
  const { leads, loading } = useSelector((state) => state.leads);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [messageId,setMessageId] = useState(openMenuId)

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Function to fetch leads with filters - removed searchTerm dependency
  const fetchLeads = useCallback(
    (searchValue = "") => {
      const searchFilter = {
        page: 1,
        limit: 50,
        search: searchValue,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      // Add phone number filter if present
      if (phoneNumber) {
        searchFilter.phoneNumber = phoneNumber;
      }

      console.log("Fetching leads with filter:", searchFilter);
      dispatch(getAllLeadsWithSearchFilter(searchFilter));
    },
    [dispatch, phoneNumber]
  );

  // Fetch leads when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedLeadId("");
      setDebouncedSearchTerm("");
      // Initial fetch without search term
      fetchLeads("");
    }
  }, [isOpen, fetchLeads]);

  // Fetch leads when debounced search term changes
  useEffect(() => {
    if (isOpen) {
      fetchLeads(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, isOpen, fetchLeads]);

  // Update filtered leads when leads data changes
  useEffect(() => {
    console.log("Leads response:", leads);

    if (leads && leads.data && leads.data.leads) {
      console.log("Setting filtered leads:", leads.data.leads);
      setFilteredLeads(leads.data.leads);
    } else if (leads && Array.isArray(leads)) {
      console.log("Setting leads array directly:", leads);
      setFilteredLeads(leads);
    } else if (leads && leads.data && Array.isArray(leads.data)) {
      console.log("Setting leads.data array:", leads.data);
      setFilteredLeads(leads.data);
    } else {
      console.log("No valid leads data structure found");
      setFilteredLeads([]);
    }
  }, [leads]);

  // Handle lead selection
  const handleSelect = () => {
    if (selectedLeadId) {
      const selectedLead = filteredLeads.find(
        (lead) => lead._id === selectedLeadId
      );
      onSelectLead(selectedLead);
    } else {
      // If no lead is selected, just close and create booking without lead
      onSelectLead(null);
    }
  };

  // Handle create new lead option
  const handleCreateNewLead = () => {
    onClose();
    // Navigate to lead creation page with phone number if available
    window.location.href = `/crm/leads/new${
      phoneNumber ? `?phone=${encodeURIComponent(phoneNumber)}` : ""
    }`;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log("Search input changed:", value);
    setSearchTerm(value);
  };

  // Handle key events to prevent bubbling
  const handleKeyDown = (e) => {
    e.stopPropagation();
    // Prevent the event from bubbling up to parent components
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-travel-purple">
            Select Lead for Booking
          </DialogTitle>
          <DialogDescription>
            Choose a lead to associate with this booking or Continue without lead 
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          {/* <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search leads..."
              className="pl-9 border-travel-purple/20 focus:border-travel-purple"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </div> */}

          {/* Create New Lead Button */}
          {/* <Button
            variant="outline"
            className="w-full border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
            onClick={handleCreateNewLead}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Lead
          </Button> */}

          {/* Leads List */}
          <div className="max-h-64 overflow-y-auto border border-travel-purple/20 rounded-md">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-travel-purple"></div>
              </div>
            ) : filteredLeads && filteredLeads.length > 0 ? (
              <RadioGroup
                value={selectedLeadId}
                onValueChange={setSelectedLeadId}
              >
                <div className="space-y-2 p-4">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="flex items-center space-x-2 p-2 hover:bg-travel-lightpink/10 rounded"
                    >
                      <RadioGroupItem value={lead._id} id={lead._id} />
                      <Label
                        htmlFor={lead._id}
                        className="flex items-center space-x-2 cursor-pointer flex-1"
                      >
                        {/* <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-travel-purple to-travel-pink rounded-full flex items-center justify-center text-white text-sm">
                            <User className="w-4 h-4" />
                          </div>
                        


                          <div className="flex flex-col w-full">
    <div className="font-medium text-gray-800">Trip to {formatName(lead.destination)}</div>
    <div className="flex justify-between text-sm text-gray-600 w-full">
      <span>{formatCurrency(lead.budget)}</span>
      <span> {format(
                                                              new Date(lead.createdAt),
                                                              "MMM d, h:mm a"
                                                            )}</span>
    </div>
  </div>
                        </div> */}

<div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 border w-full">

  <div className="w-8 h-8 bg-gradient-to-r from-travel-purple to-travel-pink rounded-full flex items-center justify-center text-white text-sm mt-1.5">
    <User className="w-4 h-4" />
  </div>

  {/* Lead Info */}
  <div className="flex flex-col w-full text-sm text-gray-700">
    {/* Destination */}
    <div className="font-medium text-gray-800">
      Trip to {formatName(lead.destination)}
    </div>

    {/* Amount */}
    <div className="text-gray-900 font-semibold text-sm">
      {formatCurrency(lead.budget)}
    </div>

    {/* Created On */}
    <div className="text-xs text-gray-500 mt-1">
      Created On: {format(new Date(lead.createdAt), "MMM d, h:mm a")}
    </div>

    {/* Travel Dates */}
    <div className="mt-1 text-xs text-gray-600 space-y-0.5">
      <div>Travel Start: {formatDate(lead?.travelStartDate)}</div>
      <div>Travel End: {formatDate(lead?.travelEndDate)}</div>
    </div>
  </div>
</div>


                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {debouncedSearchTerm
                  ? "No leads found matching your search"
                  : <> <Button
                                  variant="outline"
                                  className="w-full border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
                                  onClick={handleSelect}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create New Booking
                                </Button></>}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
          >
            Cancel
          </Button>
          <Button
          disabled={debouncedSearchTerm}
            onClick={handleSelect}
            className="bg-gradient-to-r from-travel-purple to-travel-pink hover:from-travel-purple/90 hover:to-travel-pink/90 text-white"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchLeadForBooking;
