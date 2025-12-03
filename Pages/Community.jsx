import React, { useState, useEffect } from "react";
import { Community as CommunityEntity } from "../entities/Community.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, HeartHandshake, Camera, Award, Zap, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

const communityIcons = {
  safety_consent: Shield,
  networking: HeartHandshake,
  techniques: Camera,
  equipment: Zap,
  inspiration: Award
};

const communityColors = {
  safety_consent: "from-serenity-100 via-serenity-200 to-serenity-300",
  networking: "from-sky-100 via-serenity-200 to-sky-200",
  techniques: "from-serenity-50 via-serenity-100 to-serenity-200",
  equipment: "from-midnight-100 via-serenity-200 to-serenity-300",
  inspiration: "from-serenity-200 via-serenity-300 to-serenity-400"
};

export default function Community() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiCommunities = await CommunityEntity.list();
      setCommunities(apiCommunities || []);
    } catch (error) {
      setError("We konden de communities niet laden. Probeer het later opnieuw.");
      setCommunities([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse glass-panel shadow-floating">
              <CardHeader>
                <div className="bg-serenity-100 dark:bg-midnight-700/70 h-6 rounded mb-2"></div>
                <div className="bg-serenity-100 dark:bg-midnight-700/70 h-4 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="bg-serenity-100 dark:bg-midnight-700/70 h-16 rounded"></div>
              </CardContent>
            </Card>
            ))}
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16 glass-panel shadow-floating">
          {error ? (
            <>
              <Users className="w-16 h-16 mx-auto mb-4 text-serenity-400" />
              <h3 className="text-lg font-medium text-midnight-900 dark:text-white mb-2">Er ging iets mis</h3>
              <p className="text-slate-600 dark:text-slate-200 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={loadCommunities}
                className="inline-flex items-center gap-2 rounded-full border-serenity-300 text-midnight-900 dark:text-serenity-50 bg-white/60 dark:bg-midnight-700/50 hover:bg-serenity-100/80 shadow-soft px-4 py-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Opnieuw proberen
              </Button>
            </>
          ) : (
            <>
              <Users className="w-16 h-16 mx-auto mb-4 text-serenity-400" />
              <h3 className="text-lg font-medium text-midnight-900 dark:text-white mb-2">Communities komen binnenkort</h3>
              <p className="text-slate-600 dark:text-slate-200">We werken hard aan het opzetten van inspirerende community spaces</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => {
              const IconComponent = communityIcons[community.category] || Users;
            const gradient = communityColors[community.category] || "from-serenity-100 via-serenity-200 to-serenity-300";

            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-floating transition-all duration-300 glass-panel h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${gradient} text-midnight-900 dark:text-serenity-50 border border-serenity-200/70 dark:border-midnight-200/50 shadow-soft`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-midnight-900 dark:text-white">{community.name}</CardTitle>
                          <Badge variant="outline" className={`mt-2 bg-gradient-to-r ${gradient} border-serenity-200/70 dark:border-midnight-200/50 text-xs text-midnight-900 dark:text-serenity-50 rounded-full px-3 py-1`}>
                            {community.member_count} leden
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 space-y-4">
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                      {community.description}
                    </p>
                    <Button variant="outline" className="w-full rounded-full border-serenity-300/80 dark:border-midnight-200/60 text-midnight-900 dark:text-serenity-50 bg-white/60 dark:bg-midnight-700/50 hover:bg-serenity-100/70 shadow-soft px-4 py-2.5">
                      Bekijk community
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}