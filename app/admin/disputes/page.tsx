"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { DisputeReviewDialog } from "@/components/dispute-review-dialog";
import { Clock, CheckCircle2, XCircle, Archive, Lock, AlertCircle } from "lucide-react";
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "../../../components/error-fallback";


type Dispute = Database["public"]["Tables"]["player_disputes"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

interface DisputeWithPlayer extends Dispute {
  players: Player;
}

export default function DisputesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [disputes, setDisputes] = useState<{
    pending: DisputeWithPlayer[];
    approved: DisputeWithPlayer[];
    rejected: DisputeWithPlayer[];
  }>({
    pending: [],
    approved: [],
    rejected: []
  });
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  // Reset auth state on mount and route changes
  useEffect(() => {
    setIsAuthenticated(false);
    setPassword("");
    setError("");
  }, []);

  // Fetch disputes data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let isSubscribed = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('player_disputes')
          .select(`
            *,
            players (*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!isSubscribed) return;

        setDisputes({
          pending: (data as DisputeWithPlayer[]).filter(d => d.status === 'pending'),
          approved: (data as DisputeWithPlayer[]).filter(d => d.status === 'approved'),
          rejected: (data as DisputeWithPlayer[]).filter(d => d.status === 'rejected')
        });
      } catch (err) {
        console.error('Error:', err);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isSubscribed = false;
    };
  }, [supabase, isAuthenticated]);

  const fetchDisputes = async () => {
    const { data, error } = await supabase
      .from('player_disputes')
      .select(`
        *,
        players (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    setDisputes({
      pending: (data as DisputeWithPlayer[]).filter(d => d.status === 'pending'),
      approved: (data as DisputeWithPlayer[]).filter(d => d.status === 'approved'),
      rejected: (data as DisputeWithPlayer[]).filter(d => d.status === 'rejected')
    });
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "abc123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  // Show password screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            
            <h1 className="text-xl font-medium text-center mb-6">
              Review Disputes
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg
                         hover:bg-blue-600 transition-colors duration-200"
              >
                Access Disputes
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const calculateProposedRating = (dispute: DisputeWithPlayer): number => {
    const skills = [
      dispute.proposed_speed,
      dispute.proposed_throwing,
      dispute.proposed_awareness,
      dispute.proposed_catching,
      dispute.proposed_defense,
      dispute.proposed_endurance,
    ];
    
    const skillAverage = Math.round(
      skills.reduce((sum, val) => sum + val, 0) / skills.length
    );
    
    return Math.min(99, skillAverage + dispute.proposed_spirit);
  };

  const DisputeCard = ({ dispute }: { dispute: DisputeWithPlayer }) => (
    <div 
      className={`p-4 sm:p-6 ${
        dispute.status === 'pending' && !isLoading
          ? 'hover:bg-gray-50 transition-colors cursor-pointer' 
          : ''
      }`}
      onClick={() => dispute.status === 'pending' && !isLoading ? setSelectedDispute(dispute) : null}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              {dispute.players.name}
            </h3>
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(dispute.status)}
                <span className="capitalize">{dispute.status}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{dispute.reason}</p>
          {dispute.resolution_notes && (
            <p className="mt-2 text-sm text-gray-500 italic">
              "{dispute.resolution_notes}"
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500">
            {new Date(dispute.created_at).toLocaleDateString()}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <div className="text-gray-500">Rating:</div>
            <div className="font-medium text-gray-900">
              {dispute.current_rating} → {calculateProposedRating(dispute)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      FallbackComponent={({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={() => {
        // Reset the state when the error boundary is reset
        setIsLoading(true);
        fetchDisputes();
      }}
    >
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
              Rating Disputes Review
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Review and manage player rating disputes with our transparent, community-driven process
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading disputes...</div>
          ) : (
            <div className="space-y-8">
              {/* Pending Reviews Section */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
                <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50/50">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Clock className="w-5 h-5" />
                    <h2 className="font-medium">Pending Reviews</h2>
                    <span className="text-sm text-yellow-600">({disputes.pending.length})</span>
                  </div>
                </div>
                {disputes.pending.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No pending disputes</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {disputes.pending.map((dispute) => (
                      <DisputeCard key={dispute.id} dispute={dispute} />
                    ))}
                  </div>
                )}
              </div>

              {/* Archive Section */}
              {(disputes.approved.length > 0 || disputes.rejected.length > 0) && (
                <div className="pt-8">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Archive className="w-5 h-5" />
                    <h2 className="text-lg font-medium">Archive</h2>
                  </div>

                  {/* Approved Reviews */}
                  {disputes.approved.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-4xl mx-auto mb-6">
                      <div className="px-6 py-4 border-b border-gray-100 bg-green-50/50">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle2 className="w-5 h-5" />
                          <h3 className="font-medium">Approved</h3>
                          <span className="text-sm text-green-600">({disputes.approved.length})</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {disputes.approved.map((dispute) => (
                          <DisputeCard key={dispute.id} dispute={dispute} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejected Reviews */}
                  {disputes.rejected.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
                      <div className="px-6 py-4 border-b border-gray-100 bg-red-50/50">
                        <div className="flex items-center gap-2 text-red-800">
                          <XCircle className="w-5 h-5" />
                          <h3 className="font-medium">Rejected</h3>
                          <span className="text-sm text-red-600">({disputes.rejected.length})</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {disputes.rejected.map((dispute) => (
                          <DisputeCard key={dispute.id} dispute={dispute} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Dialog */}
        {selectedDispute && (
          <DisputeReviewDialog
            dispute={selectedDispute}
            player={selectedDispute.players}
            onClose={() => setSelectedDispute(null)}
            onDisputeResolved={fetchDisputes}
            isOpen={!!selectedDispute}
          />
        )}
      </div>
    </ErrorBoundary>
  );
} 