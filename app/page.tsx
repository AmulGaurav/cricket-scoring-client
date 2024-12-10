"use client";

import { apiClient, apiClient2 } from "@/utils/axios";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdSwap } from "react-icons/io";
import { Switch } from "@/components/ui/switch";
import { BsChevronDown } from "react-icons/bs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiCloseLargeFill } from "react-icons/ri";
import SearchBar from "@/components/SearchBar";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

interface BatterInterface {
  name: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
}

interface BowlerInterface {
  name: string;
  ballsBowled: number;
  oversBowled: number;
  runsConceded: number;
  wicketsTaken: number;
}

interface ExtrasInterface {
  wide: number;
  noBall: number;
}

interface TeamInterface {
  name: string;
  totalRuns: number;
  extras: ExtrasInterface;
  wicketsLost: number;
  overs: number;
  batters: {
    striker: BatterInterface;
    nonStriker: BatterInterface;
  };
  bowlers: {
    bowler: BowlerInterface;
    nonBowler: BowlerInterface;
  };
}

interface CurrentOver {
  ballsBowled: number;
  overNumber: number;
}

interface Match {
  teamA: TeamInterface;
  teamB: TeamInterface;
  currentBattingTeam: "teamA" | "teamB";
  innings: 1 | 2;
  currentOver: CurrentOver;
  commentary: Array<{ ball: string; run: number; text: string }>;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setSocket] = useState<WebSocket | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [run, setRun] = useState(0);
  const [extras, setExtras] = useState("");
  const [isWicket, setIsWicket] = useState(false);
  const [matchOverMessage, setMatchOverMessage] = useState("");

  const updateScore = (run: number, extras: string, isWicket: boolean) => {
    apiClient2
      .post(
        "/api/update-score",
        { run, extras, isWicket },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        if (res.data.matchOver) {
          setMatchOverMessage(res.data.matchOver);
          alert(res.data.matchOver);
        }
      })
      .catch((error) => console.error("Error updating score", error));
  };

  useEffect(() => {
    apiClient
      .get("/user/me", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then(() => setLoading(false))
      .catch(() => router.push("/auth/signin"));
  }, [router]);

  useEffect(() => {
    // WebSocket Connection
    let ws;
    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL?.split("//")[1];

    if (backend_url) ws = new WebSocket("wss://" + backend_url);
    else ws = new WebSocket("wss://localhost:3001");

    setSocket(ws);
    updateScore(0, "start", false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "scoreUpdate") {
        setMatch(data.match);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading) return <Loader />;

  // Render commentary
  const renderCommentary = () => (
    <div className="space-y-2.5">
      {match?.commentary?.slice(-5).map((comment, index) => (
        <div key={index} className="flex items-center justify-around">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#bbf7d0]">
            {comment.run}
          </div>

          <div className="max-w-sm flex items-center gap-4">
            <div className="font-medium">{comment.ball}</div>
            <div>{comment.text}.</div>
          </div>

          <div className="cursor-pointer">
            <BsThreeDotsVertical size={"18px"} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="">
      <div className="min-h-screen lg:grid grid-cols-3 gap-5 px-6 py-4">
        <div className="col-span-2 px-2 pt-8 border shadow-lg rounded-lg">
          <div className="grid grid-cols-6 gap-5 mb-14 font-medium">
            <div className="col-span-4">
              <div className="flex justify-around gap-2">
                <div>
                  <div>Batsman (Striker)</div>
                  <Select>
                    <SelectTrigger className="w-[80px] sm:w-[108px] md:w-[140px] lg:w-[196px] xl:w-[250px] 2xl:w-[386px]">
                      <SelectValue
                        placeholder={`${
                          match?.currentBattingTeam === "teamA"
                            ? match.teamA.batters.striker.name
                            : match?.teamB.batters.striker.name
                        }`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Tanzim Hasan Sakib</SelectItem>
                      <SelectItem value="banana">Towhid Hridoy</SelectItem>
                      <SelectItem value="blueberry">Virat Kohli</SelectItem>
                      <SelectItem value="grapes">M.S. Dhoni</SelectItem>
                      <SelectItem value="pineapple">
                        Sachin Tendulkar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center">
                  <IoMdSwap color="red" size={"25px"} />
                </div>

                <div>
                  <div>Batsman (Non Striker)</div>
                  <Select>
                    <SelectTrigger className="w-[80px] sm:w-[108px] md:w-[140px] lg:w-[196px] xl:w-[250px] 2xl:w-[386px]">
                      <SelectValue
                        placeholder={`${
                          match?.currentBattingTeam === "teamA"
                            ? match.teamA.batters.nonStriker.name
                            : match?.teamB.batters.nonStriker.name
                        }`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Tohid Hridoy</SelectItem>
                      <SelectItem value="banana">Tanzim Hasan Sakib</SelectItem>
                      <SelectItem value="blueberry">Virat Kohli</SelectItem>
                      <SelectItem value="grapes">M.S. Dhoni</SelectItem>
                      <SelectItem value="pineapple">
                        Sachin Tendulkar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex justify-center">
              <div>
                <div>Bowler</div>
                <Select>
                  <SelectTrigger className="w-[80px] sm:w-[108px] md:w-[140px] lg:w-[196px] xl:w-[250px] 2xl:w-[390px]">
                    <SelectValue
                      placeholder={`${
                        match?.currentBattingTeam === "teamA"
                          ? match.teamB.bowlers.bowler.name
                          : match?.teamA.bowlers.bowler.name
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banana">Nitish Kumar Reddy</SelectItem>
                    <SelectItem value="apple">Jasprit Bumrah</SelectItem>
                    <SelectItem value="blueberry">Trent Boult</SelectItem>
                    <SelectItem value="grapes">Adam Zampa</SelectItem>
                    <SelectItem value="pineapple">Sachin Tendulkar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-16">
            <div className="pl-3 space-y-3.5 font-bold">
              <div>
                Score:{" "}
                {match?.currentBattingTeam === "teamA"
                  ? match.teamA.totalRuns
                  : match?.teamB.totalRuns}
              </div>
              <div>
                Extra:{" "}
                {match?.currentBattingTeam === "teamA"
                  ? match.teamA.extras.wide + match.teamA.extras.noBall
                  : (match?.teamB?.extras?.wide ?? 5) +
                    (match?.teamB?.extras?.noBall ?? 3)}
              </div>
            </div>

            <div className="mr-4 lg:mr-10 px-2 py-1 flex flex-col justify-center items-center border rounded-lg font-medium text-sm gap-1">
              <div>
                <Switch />
              </div>
              <div>Mute & Text Off</div>
            </div>
          </div>

          <div className="space-y-2 font-bold text-white text-xl text-center">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1 grid gap-2">
                <button className="bg-[#2c7b0d] py-7 flex justify-center items-center rounded-lg">
                  Ball Start
                </button>
                <button
                  className="bg-[#b36b34] py-7 flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(0);
                    setExtras("wide");
                    setIsWicket(false);
                  }}
                >
                  Wide
                </button>
                <button
                  className="bg-[#003e57] py-7 flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(0);
                    setExtras("noBall");
                    setIsWicket(false);
                  }}
                >
                  No Ball
                </button>
              </div>

              <div className="col-span-1 grid gap-2">
                <button
                  className="bg-[#1b00ff] flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(0);
                    setExtras("");
                    setIsWicket(false);
                  }}
                >
                  0
                </button>
                <button
                  className="bg-[#008380] flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(2);
                    setExtras("");
                    setIsWicket(false);
                  }}
                >
                  2
                </button>
              </div>

              <div className="col-span-1 grid gap-2">
                <button
                  className="bg-[#003e57] flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(1);
                    setExtras("");
                    setIsWicket(false);
                  }}
                >
                  1
                </button>
                <button
                  className="bg-[#86efac] flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(4);
                    setExtras("");
                    setIsWicket(false);
                  }}
                >
                  4
                </button>
              </div>

              <div className="col-span-1 grid gap-2">
                <button
                  className="bg-[#c40004] flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(0);
                    setExtras("");
                    setIsWicket(true);
                  }}
                >
                  Wicket
                </button>
                <button
                  className="bg-[#9ca3af] flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => {
                    setRun(6);
                    setExtras("");
                    setIsWicket(false);
                  }}
                >
                  6
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className="grid gap-2">
                <button className="bg-[#6d00a8] py-7 flex justify-center items-center rounded-lg">
                  Bowler Stop
                </button>
                <button className="bg-[#003e57] py-7 flex justify-center items-center rounded-lg">
                  Others
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#1b00ff] py-7 flex justify-center items-center rounded-lg">
                  1 or 2
                </button>
                <button className="bg-[#6d00a8] py-7 flex justify-center items-center rounded-lg">
                  3
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#6d00a8] py-7 flex justify-center items-center rounded-lg">
                  2 or 4
                </button>
                <button className="bg-[#003e57] py-7 flex justify-center items-center rounded-lg">
                  Boundary Check
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#964100] py-7 flex justify-center items-center rounded-lg">
                  4 or 6
                </button>
                <button className="bg-[#47787b] py-7 flex justify-center items-center rounded-lg">
                  Appeal
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#6d00a8] py-7 flex justify-center items-center rounded-lg">
                  Ball In Air
                </button>
                <button className="bg-[#003e57] py-7 flex justify-center items-center rounded-lg">
                  Catch Drop
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="grid gap-2">
                <button className="bg-[#00b7dd] py-7 flex justify-center items-center rounded-lg">
                  Leg Bye
                </button>
                <button
                  className="bg-[#36532b] py-7 flex justify-center items-center rounded-lg border-2 border-black"
                  onClick={() => updateScore(run, extras, isWicket)}
                >
                  Done
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#00af3e] py-7 flex justify-center items-center rounded-lg">
                  Bye
                </button>
                <button className="bg-[#003e57] py-7 flex justify-center items-center rounded-lg">
                  Misfield
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#47787b] py-7 flex justify-center items-center rounded-lg">
                  Third Umpire
                </button>
                <button className="bg-[#6500dd] py-7 flex justify-center items-center rounded-lg">
                  Overthrow
                </button>
              </div>

              <div className="grid gap-2">
                <button className="bg-[#c40004] py-7 flex justify-center items-center rounded-lg">
                  Review
                </button>
                <button className="bg-[#c40004] py-7 flex justify-center items-center rounded-lg">
                  Wicket Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#fafafa] border shadow-lg p-4 col-span-1 rounded-lg">
          <div className="flex items-center gap-5 px-1 mb-4">
            <div>
              <BsChevronDown size={"20px"} />
            </div>
            <div>Scorecard</div>
          </div>

          <div className="border rounded-t-xl mb-2">
            <div className="bg-[#f3f4f6] border rounded-t-xl text-end font-extrabold text-[#0271f0] pr-2 py-1.5 cursor-pointer">
              View Full Score Card
            </div>

            <div className="flex justify-around items-center py-2">
              <div className="flex flex-col items-center gap-2">
                <div>IND</div>
                <div>
                  <Avatar className="size-14">
                    <AvatarImage src="/india.webp" alt="India flag" />
                    <AvatarFallback>IND</AvatarFallback>
                  </Avatar>
                </div>
                <div className="border rounded-lg text-center px-2 py-1">
                  <div>
                    {match?.teamA.totalRuns} / {match?.teamA.wicketsLost}
                  </div>
                  <div>
                    Over {match?.teamA.overs}.
                    {match?.innings === 1 ? match.currentOver.ballsBowled : 0}
                  </div>
                </div>
              </div>

              <div className="text-red-600 font-bold text-xl">vs</div>

              <div className="flex flex-col items-center gap-2">
                <div>BAN</div>
                <div>
                  <Avatar className="size-14">
                    <AvatarImage src="/bangladesh.webp" alt="Bangladesh flag" />
                    <AvatarFallback>BAN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="border rounded-lg text-center px-2 py-1">
                  <div>
                    {match?.teamB.totalRuns} / {match?.teamB.wicketsLost}
                  </div>
                  <div>
                    Over {match?.teamB.overs}.
                    {match?.innings === 2 ? match.currentOver.ballsBowled : 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#e5e7eb] border font-bold text-center py-3">
              {matchOverMessage}
            </div>
          </div>

          <div className="border mb-3">
            <div className="bg-[#e5e7eb] grid grid-cols-6 font-extrabold text-[#6b7280] px-2 xl:px-4 2xl:px-6 py-1">
              <div className="col-span-2">Batsman</div>
              <div className="text-center">R</div>
              <div className="text-center">B</div>
              <div className="text-center">4s</div>
              <div className="text-center">6s</div>
            </div>
            <div className="grid grid-cols-6  px-2 xl:px-4 2xl:px-6 py-1.5 bg-white">
              <div className="col-span-2 space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.striker.name
                    : match?.teamB.batters.striker.name}
                  *
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.nonStriker.name
                    : match?.teamB.batters.nonStriker.name}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.striker.runs
                    : match?.teamB.batters.striker.runs}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.nonStriker.runs
                    : match?.teamB.batters.nonStriker.runs}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.striker.ballsFaced
                    : match?.teamB.batters.striker.ballsFaced}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.nonStriker.ballsFaced
                    : match?.teamB.batters.nonStriker.ballsFaced}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.striker.fours
                    : match?.teamB.batters.striker.fours}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.nonStriker.fours
                    : match?.teamB.batters.nonStriker.fours}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.striker.sixes
                    : match?.teamB.batters.striker.sixes}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamA.batters.nonStriker.sixes
                    : match?.teamB.batters.nonStriker.sixes}
                </div>
              </div>
            </div>
          </div>

          <div className="border mb-3">
            <div className="bg-[#e5e7eb] grid grid-cols-6 font-extrabold text-[#6b7280] px-2 xl:px-4 2xl:px-6 py-1">
              <div className="col-span-2">Bowler</div>
              <div className="text-center">O</div>
              <div className="text-center">M</div>
              <div className="text-center">R</div>
              <div className="text-center">W</div>
            </div>
            <div className="grid grid-cols-6  px-2 xl:px-4 2xl:px-6 py-1.5 bg-white">
              <div className="col-span-2 space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.bowler.name
                    : match?.teamA.bowlers.bowler.name}
                  *
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.nonBowler.name
                    : match?.teamA.bowlers.nonBowler.name}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.bowler.oversBowled
                    : match?.teamA.bowlers.bowler.oversBowled}
                  .
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.bowler.ballsBowled
                    : match?.teamA.bowlers.bowler.ballsBowled}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.nonBowler.oversBowled
                    : match?.teamA.bowlers.nonBowler.oversBowled}
                  .
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.nonBowler.ballsBowled
                    : match?.teamA.bowlers.nonBowler.ballsBowled}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>0</div>
                <div>0</div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.bowler.runsConceded
                    : match?.teamA.bowlers.bowler.runsConceded}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.nonBowler.runsConceded
                    : match?.teamA.bowlers.nonBowler.runsConceded}
                </div>
              </div>
              <div className="text-center  space-y-2">
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.bowler.wicketsTaken
                    : match?.teamA.bowlers.bowler.wicketsTaken}
                </div>
                <div>
                  {match?.currentBattingTeam === "teamA"
                    ? match.teamB.bowlers.nonBowler.wicketsTaken
                    : match?.teamA.bowlers.nonBowler.wicketsTaken}
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg bg-[#f3f4f6] flex items-center justify-between p-4 mb-2">
            <div className="font-medium">
              {match
                ? match?.currentOver.overNumber * 6 +
                  match?.currentOver.ballsBowled
                : 0}{" "}
              Balls
            </div>
            <div className="flex gap-2">
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">1</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">1</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">0</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">1</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">1</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">4</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">1</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">1</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">0</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">0</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">4</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">0</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">0</div>
              <div className="bg-[#e5e7eb] rounded-md border px-1.5">4</div>
            </div>
          </div>

          <div className="bg-[#f3f4f6] border rounded-lg px-4 py-3 flex gap-12 mb-3.5">
            <div className="font-medium">Extra</div>
            <div>
              11 (<span className="font-semibold">b</span> 0,{" "}
              <span className="font-semibold">lb</span> 4,{" "}
              <span className="font-semibold">wd</span>{" "}
              {match?.currentBattingTeam === "teamA"
                ? match.teamA.extras.wide
                : match?.teamB.extras.wide}
              , <span className="font-semibold">nb</span>{" "}
              {match?.currentBattingTeam === "teamA"
                ? match.teamA.extras.noBall
                : match?.teamB.extras.noBall}
              , <span className="font-semibold">P</span> 0)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-1.5">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={`${
                    match?.innings === 1 ? match.teamA.name : match?.teamB.name
                  }`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banana">Bangladeshy</SelectItem>
                <SelectItem value="apple">India</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`${match?.innings}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banana">1</SelectItem>
                <SelectItem value="apple">2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mb-4">
            <SearchBar />

            <div className="flex items-center px-5 py-4 bg-[#ff4d4f] rounded-lg cursor-pointer">
              <RiCloseLargeFill size={"17px"} color="white" />
            </div>
          </div>

          <div className="border mb-3"></div>

          {renderCommentary()}
        </div>
      </div>
    </div>
  );
}
