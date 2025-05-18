import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface TournamentFormProps {
  onSuccess?: () => void;
}

const TournamentForm: FC<TournamentFormProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();

  // Define form schema based on the tournament schema
  const formSchema = z.object({
    name: z.string().min(3, { message: t("nameRequired") }),
    description: z.string().min(10, { message: t("descriptionRequired") }),
    type: z.enum(["solo", "duo", "squad"]),
    gameMode: z.enum(["battle-royale", "clash-squad"]),
    map: z.string().min(1, { message: t("mapRequired") }),
    entryFee: z.coerce.number().min(10, { message: t("entryFeeRequired") }),
    maxTeams: z.coerce.number().min(2, { message: t("maxTeamsRequired") }),
    startTime: z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, { message: t("startTimeValid") }),
    visibility: z.enum(["public", "private"]),
    prizes: z.array(z.object({
      position: z.number(),
      amount: z.number(),
    })).min(1, { message: t("prizesRequired") }),
    rules: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "squad",
      gameMode: "battle-royale",
      map: "Bermuda",
      entryFee: 100,
      maxTeams: 25,
      startTime: "",
      visibility: "public",
      prizes: [
        { position: 1, amount: 5000 },
        { position: 2, amount: 3000 },
        { position: 3, amount: 2000 },
      ],
      rules: "",
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!user) throw new Error("User not logged in");
      
      const response = await apiRequest("POST", "/api/tournaments", {
        ...data,
        status: "upcoming",
        prizePool: data.prizes.reduce((sum, prize) => sum + prize.amount, 0),
        createdBy: user.id,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("tournamentCreated"),
        description: t("tournamentCreatedMessage"),
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Create tournament error:", error);
      toast({
        title: t("tournamentCreateFailed"),
        description: t("tournamentCreateFailedMessage"),
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    createTournamentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("tournamentName")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("tournamentNamePlaceholder")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("tournamentType")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTournamentType")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="solo">{t("solo")}</SelectItem>
                    <SelectItem value="duo">{t("duo")}</SelectItem>
                    <SelectItem value="squad">{t("squad")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gameMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("gameMode")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectGameMode")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="battle-royale">{t("battleRoyale")}</SelectItem>
                    <SelectItem value="clash-squad">{t("clashSquad")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dateAndTime")}</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("entryFeeBDT")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="100" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxTeams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxTeams")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="25" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("tournamentVisibility")}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <label htmlFor="public">{t("public")}</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <label htmlFor="private">{t("private")}</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="map"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("map")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectMap")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bermuda">Bermuda</SelectItem>
                  <SelectItem value="Kalahari">Kalahari</SelectItem>
                  <SelectItem value="Purgatory">Purgatory</SelectItem>
                  <SelectItem value="Alpine">Alpine</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("descriptionPlaceholder")}
                  className="h-24"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("rules")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("rulesPlaceholder")}
                  className="h-24"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <h3 className="text-lg font-bold mb-3">{t("prizeDistribution")}</h3>
          <div className="space-y-3">
            {form.watch("prizes").map((prize, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="number"
                  className="w-16"
                  value={prize.position}
                  onChange={(e) => {
                    const prizes = [...form.watch("prizes")];
                    prizes[index].position = parseInt(e.target.value) || 0;
                    form.setValue("prizes", prizes);
                  }}
                  placeholder={String(index + 1)}
                />
                <span>
                  {index === 0
                    ? t("stPlace")
                    : index === 1
                    ? t("ndPlace")
                    : t("rdPlace")}
                </span>
                <span>:</span>
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">৳</span>
                  <Input
                    type="number"
                    className="pl-8"
                    value={prize.amount}
                    onChange={(e) => {
                      const prizes = [...form.watch("prizes")];
                      prizes[index].amount = parseInt(e.target.value) || 0;
                      form.setValue("prizes", prizes);
                    }}
                    placeholder={index === 0 ? "5000" : index === 1 ? "3000" : "2000"}
                  />
                </div>
              </div>
            ))}
            {form.watch("prizes").length < 5 && (
              <Button
                type="button"
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={() => {
                  const prizes = [...form.watch("prizes")];
                  prizes.push({
                    position: prizes.length + 1,
                    amount: 1000,
                  });
                  form.setValue("prizes", prizes);
                }}
              >
                <i className="ri-add-line mr-1"></i>
                {t("addMorePrizes")}
              </Button>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full py-3" 
            disabled={createTournamentMutation.isPending}
          >
            {createTournamentMutation.isPending 
              ? t("creating") 
              : t("createTournament")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TournamentForm;
