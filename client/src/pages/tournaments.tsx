import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useTournaments } from "@/hooks/use-tournament";
import TournamentCard from "@/components/ui/tournament-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const TournamentsPage: FC = () => {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  // Fetch tournaments with filters
  const { data: tournaments, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTournaments({ 
    type: typeFilter, 
    status: statusFilter 
  });

  return (
    <main className="pt-16 pb-20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-poppins">{t("tournaments")}</h2>
          <div className="flex space-x-2">
            <Select onValueChange={(value) => setTypeFilter(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-28 sm:w-32">
                <SelectValue placeholder={t("allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="solo">{t("solo")}</SelectItem>
                <SelectItem value="duo">{t("duo")}</SelectItem>
                <SelectItem value="squad">{t("squad")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-28 sm:w-32">
                <SelectValue placeholder={t("allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="live">{t("live")}</SelectItem>
                <SelectItem value="upcoming">{t("upcoming")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <Skeleton className="w-full sm:w-32 h-32" />
                  <div className="p-3 flex-grow">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-12 w-16" />
                      <Skeleton className="h-12 w-16" />
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : tournaments && tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament} 
                variant="horizontal"
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground">
              <i className="ri-trophy-line text-4xl mb-2"></i>
              <p>{t("noTournamentsFound")}</p>
            </div>
          )}
        </div>
        
        {(tournaments && tournaments.length > 0 && hasNextPage) && (
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center justify-center space-x-2"
            >
              {isFetchingNextPage ? t("loading") : (
                <>
                  <span>{t("loadMore")}</span>
                  <i className="ri-arrow-down-line"></i>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default TournamentsPage;
