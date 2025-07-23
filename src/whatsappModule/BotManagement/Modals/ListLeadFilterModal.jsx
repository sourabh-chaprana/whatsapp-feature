import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { getAllLeadsWithSearchFilter } from "../../../store/slices/leads/leadThunk";
import { formatCurrency } from "../../../utils/currencyFunc";
import { formatName } from "../../../utils/textUtils";
import { formatDate } from "../../../utils/bookingUtils";
import { format } from "date-fns";
import normalizePhoneNumber from "../../../utils/normalizePhoneNumber";

const ListLeadFilterModal = ({
  isOpen,
  onClose,
  phoneNumber,
  onSelectLead,
  messageId
}) => {
  const dispatch = useDispatch();
  const { leads, loading } = useSelector((state) => state.leads);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);

  // Function to fetch leads with filters
  const fetchLeads = useCallback(() => {
    const searchFilter = {
      page: 1,
      limit: 50,
      sortBy: "updatedAt",
      sortOrder: "desc",
    };

    // Add phone number filter if present
    if (phoneNumber) {
      searchFilter.phoneNumber = normalizePhoneNumber(phoneNumber);
    }

    dispatch(getAllLeadsWithSearchFilter(searchFilter));
  }, [dispatch, phoneNumber]);

  // Fetch leads when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLeadId("");
      fetchLeads();
    }
  }, [isOpen, fetchLeads]);

  // Update filtered leads when leads data changes
  useEffect(() => {
    if (leads && leads.data && leads.data.leads) {
      setFilteredLeads(leads.data.leads);
    } else if (leads && Array.isArray(leads)) {
      setFilteredLeads(leads);
    } else if (leads && leads.data && Array.isArray(leads.data)) {
      setFilteredLeads(leads.data);
    } else {
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
      onClose();
    }
  };

  // Handle create new lead
  const handleCreateNewLead = () => {
    onClose();
    // Navigate to lead creation page with phone number and message_id
    window.location.href = `/crm/leads/new${
      phoneNumber ? `?phone=${encodeURIComponent(phoneNumber)}&` : "?"
    }message_id=${messageId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-travel-purple">
            Select Lead for Attachment
          </DialogTitle>
          <DialogDescription>
            Choose a lead to attach this file or create a new lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Lead Button */}
          <Button
            variant="outline"
            className="w-full border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
            onClick={handleCreateNewLead}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Lead
          </Button>

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
                        <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 border w-full">
                          {/* Icon */}
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
                No leads available for this contact
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
            onClick={handleSelect}
            disabled={!selectedLeadId}
            className="bg-gradient-to-r from-travel-purple to-travel-pink hover:from-travel-purple/90 hover:to-travel-pink/90 text-white"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListLeadFilterModal;