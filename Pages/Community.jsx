import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Community as CommunityEntity } from "../entities/Community.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, HeartHandshake, Camera, Award, Zap, RefreshCcw, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { PAGE_ROUTES } from "@/utils";

const communityIcons = {
  safety_consent: Shield,
  networking: HeartHandshake,
  techniques: Camera,
  equipment: Zap,
  inspiration: Award
};

const communityColors = {
  safety_consent: "bg-red-100 text-red-800 border-red-200",
  networking: "bg-blue-100 text-blue-800 border-blue-200",
  techniques: "bg-purple-100 text-purple-800 border-purple-200",
  equipment: "bg-green-100 text-green-800 border-green-200",
  inspiration: "bg-amber-100 text-amber-800 border-amber-200"
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
    <div className="max-w-6xl mx-auto px-4 py-2 space-y-6">
      <Card className="glass-panel border border-serenity-200/60 dark:border-midnight-50/30 shadow-soft">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-serenity-500 text-white flex items-center justify-center shadow-floating">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-serenity-600 dark:text-serenity-200">Community chat</p>
              <h3 className="text-xl font-semibold text-midnight-900 dark:text-white">Praat mee met andere makers</h3>
              <p className="text-slate-700 dark:text-slate-200 text-sm max-w-2xl">
                Deel ideeën, vraag feedback en bouw samen aan nieuwe projecten in onze directe chatruimte.
              </p>
            </div>
          </div>
          <Link to={PAGE_ROUTES.chat} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-full bg-serenity-500 text-white hover:bg-serenity-600 shadow-floating inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ga naar de chat
            </Button>
          </Link>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse glass-panel">
              <CardHeader>
                <div className="bg-serenity-100 h-6 rounded mb-2"></div>
                <div className="bg-serenity-100 h-4 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="bg-serenity-100 h-16 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16">
          {error ? (
            <>
              <Users className="w-16 h-16 mx-auto mb-4 text-serenity-400" />
              <h3 className="text-lg font-medium text-midnight-900 dark:text-white mb-2">Er ging iets mis</h3>
              <p className="text-slate-600 dark:text-slate-200 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={loadCommunities}
                className="inline-flex items-center gap-2 rounded-full border-serenity-300 text-serenity-800 hover:bg-serenity-100/70 shadow-soft"
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
            const colorClass = communityColors[community.category] || "bg-gray-100 text-gray-800 border-gray-200";
            
            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-floating transition-all duration-300 glass-panel h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colorClass} border`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-midnight-900 dark:text-white">{community.name}</CardTitle>
                          <Badge variant="outline" className={`mt-1 ${colorClass} border text-xs`}>
                            {community.member_count} leden
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-4">
                      {community.description}
                    </p>
                    <Button variant="outline" className="w-full rounded-full border-serenity-300 text-serenity-800 hover:bg-serenity-100/70 shadow-soft">
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