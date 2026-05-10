"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import { env } from "@/src/config/env"

interface BestSong {
  id: number;
  name: string;
  score: number;
}

interface UserDataProps {
  id: number;
  handler?: string;
  profile_url?: string;
  ranking?: string;
  streak?: number;
  total_score: number;
  best_song?: BestSong;
  sing_count?: number;
}

export default function FullUser({User, isCurrentUser}: {User: UserDataProps, isCurrentUser: boolean  }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
 
  const [formData, setFormData] = useState({
    handler: User.handler,
    profile_url: User.profile_url || ""
  })

  
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const res = await fetch(`${env.API_URL}/users/${User.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "omit", 
        body: JSON.stringify({
          handler: formData.handler,
          profile_url: formData.profile_url,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
        
      }

      if (formData.handler !== User.handler) {
        router.push(`/user/${formData.handler}`)
      } else {
        // If only the profile picture changed, we stay on the page.
        await mutate(`${env.API_URL}/users/handler/${User.handler}`)
        setIsEditing(false)
      }
      
    } catch (error) {
      
      console.error("Profile update error:", error)
      alert("Failed to update profile. The handler might already be taken.")
    } finally {
      setIsSaving(false)
    }
  }
  // console.log("Userrr" ,User)
  return (
    <div className="relative flex flex-col rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 sm:p-8 overflow-hidden">
      
      {/* Decorative top-left angled label */}
      <div className="absolute top-0 left-0 bg-neutral-800 text-neutral-300 text-sm font-extrabold px-6 py-1 rounded-br-2xl">
        1
      </div>

      {/* Edit Button and Save/Cancel Actions */}
      {isCurrentUser && (
        <div className="flex justify-end gap-2 z-10">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setFormData({ handler: User.handler, profile_url: User.profile_url || "" })
                  setIsEditing(false)
                }} 
                disabled={isSaving}
                className="text-xs font-bold uppercase tracking-wider bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="text-xs font-bold uppercase tracking-wider bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold uppercase tracking-wider bg-[#28282a] hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      )}


      <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-6 mt-4">
        <div className="flex flex-col w-full gap-6">
          
          {/* Name */}
          <div className="flex items-center gap-3">
              {isEditing ? (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-widest">Enter Name</label>
                        <input 
                            type="text"
                            value={formData.handler}
                            onChange={(e) => setFormData({ ...formData, handler: e.target.value })}
                            className="bg-[#121212] border border-sky-500/30 rounded-lg px-3 py-1.5 text-2xl font-bold tracking-tight focus:outline-none w-full max-w-xs transition-all"
                        />
                    </div>
                ) : (
                <>
                  <h1 className="text-3xl font-black italic tracking-wider text-white sm:text-4xl uppercase">
                    {User?.handler || User.id.toString() } 
                  </h1>
                  <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </>
              )}
          </div>

          <div className="flex flex-col gap-4 w-full">
            
            {/* Div 1: Ranking, Streak, Total Score */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-[#121212] p-5 pr-8">
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Ranking</div>
                  <div className="text-xl font-bold text-neutral-100">{User?.ranking || "N/A" }</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 10.5c-1.8 0-3-1.6-3-3.2 0-1.2.6-2.3 1.6-2.9-.6-.3-1.4-.4-2.1-.4-4 0-7.3 3.4-7.3 7.6 0 2.4 1.1 4.5 2.9 6 1.4 1.1 3.2 1.8 5.1 1.8 1.4 0 2.8-.3 4-.9 2.5-1.3 4.3-4 4.3-7.1 0-2.8-1.7-5.2-4.1-6.5.6.8.9 1.8.9 2.8 0 1.5-1 2.8-2.3 2.8zM12 21c-3.3 0-6-2.7-6-6 0-2.2 1.2-4.1 3-5.1.4 1.9 2 3.6 4.1 4 .6-.8 1.5-1.4 2.5-1.4.3 0 .7.1 1 .2 1.3 1.9 1.4 4.5.1 6.3C15.4 20.3 13.8 21 12 21z"/></svg>
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Streak</div>
                  <div className="text-xl font-bold text-neutral-100">{User?.streak || 0}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Total Score</div>
                  <div className="text-xl font-bold text-neutral-100">{User.total_score.toLocaleString()}</div>
                </div>
              </div>
              
            </div>

            {/* Div 2: Best Song, Sing Count */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 rounded-xl border border-neutral-800 bg-[#161616] p-5">
              <div className="flex flex-col ">
                <h2 className="text-sm font-bold tracking-widest text-neutral-500 uppercase mb-2">Top Performance</h2>
                
                <div className="flex items-center gap-6 justify-between">
                
                  <span className="text-xl font-black italic text-white uppercase">{User.best_song?.name || ""}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{User.best_song?.score.toLocaleString()|| ""}</span>
                    <span className="text-neutral-400 font-semibold">points</span>
                  </div>
                
                </div>
              </div>

              <div className="hidden sm:block w-px bg-neutral-800"></div>

              <div className="flex flex-col justify-center">
                <h2 className="text-sm font-bold tracking-widest text-neutral-500 uppercase mb-2">Total Plays</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{User?.sing_count || 0}</span>
                  <span className="text-neutral-400 font-semibold">Songs</span>
                </div>
              </div>
            </div>

          </div>
        </div>
           

        {/* Avatar */}
        <div className="relative shrink-0 self-center sm:self-start group">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-neutral-800 bg-neutral-900 overflow-hidden">
            {User.profile_url ? (
                  <img src={User.profile_url} alt="Avatar" className="w-full h-full object-cover opacity-90" />
              ) : (
                  <span className="text-xs text-sky-200/70">Avatar</span>
              )}
          </div>
        </div>
        
      </div>
    </div>
  );
}