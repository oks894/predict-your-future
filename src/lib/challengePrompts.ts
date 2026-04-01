// AI Challenge Roast Generator

export function generateChallengeRoast(challengeId: string, inputs: Record<string, string>, players: string[]): { text: string, percentage: number } {
  let percent = Math.floor(Math.random() * 20) + 80;
  let text = '';
  const primeName = players[0] || 'Bro';

  switch (challengeId) {
    case 'excuse-trial':
      const excuse = inputs['excuse'] || 'I forgot';
      percent = Math.floor(Math.random() * 90) + 10;
      text = `[ BELIEVABILITY MATCH: ${percent}% ]

${primeName}, you really thought "${excuse}" was a good excuse? First of all, a 5-year-old could lie better than you. The fact that you typed that with confidence is clinically studying material. The AI detected 100% cap. Go apologize to whoever you fed this garbage to immediately.`;
      break;

    case 'red-flag-confess':
      const flag = inputs['habit'] || 'Being me';
      text = `[ TERMINAL RED FLAG 🚩 ]

The system was running fine until you confessed to "${flag}". ${primeName}, you're not just a red flag, you're the entire Communist parade. Who hurt you? Why are you like this? Please isolate yourself from society until you learn how to behave. Disgusting.`;
      break;

    case 'text-graveyard':
      const sentText = inputs['text'] || 'hey';
      text = `[ CRINGE DETECTED 💀 ]

Oh my god. You actually sent "${sentText}" and pressed send? ${primeName}, my circuits are melting from the sheer desperation radiating off this message. The energy here is giving "left on read since 2018". Delete their number, drop your phone in a river, and start a new life.`;
      break;

    case 'vocab-roast':
      const slang = inputs['vocab'] || 'fr fr bussin';
      text = `[ NPC DETECTED 🗣️ ]

Analysis complete. Based on "${slang}", ${primeName}'s entire personality was downloaded from a TikTok comment section. You don't have original thoughts, you just recycle whatever trend your algorithm feeds you. Stop trying so hard to sound interesting when you're literally the default iOS voice.`;
      break;

    case 'main-character':
      const p1Words = inputs['player1Words'] || 'chill';
      const p2Words = inputs['player2Words'] || 'cool';
      const p2Name = players[1] || 'Your friend';
      
      const p1Delusion = Math.floor(Math.random() * 100);
      const p2Delusion = 100 - p1Delusion;
      
      if (p1Delusion > p2Delusion) {
        text = `[ DELUSION DETECTED 🎬 ]

${primeName} claims they are "${p1Words}". ${p2Name} claims they are "${p2Words}". 
Verdict: ${primeName} is significantly more delusional (${p1Delusion}% cap detected). ${primeName}, you're giving heavy extra/background tree energy. You are NOT the main character. ${p2Name} is barely surviving as sidekick. You both need to touch grass simultaneously.`;
      } else {
        text = `[ DELUSION DETECTED 🎬 ]

${primeName} claims they are "${p1Words}". ${p2Name} claims they are "${p2Words}". 
Verdict: ${p2Name} is living an absolute lie (${p2Delusion}% cap detected). ${primeName} isn't much better, but ${p2Name} literally thinks their life is a movie while acting like a skipped YouTube ad. Embarrassing for both.`;
      }
      break;

    case 'apology-battle':
      const apol1 = inputs['apology1'] || 'my bad';
      const apol2 = inputs['apology2'] || 'sorry lol';
      const p2Apol = players[1] || 'Player 2';
      
      const faker = Math.random() > 0.5 ? primeName : p2Apol;
      const fakeApology = faker === primeName ? apol1 : apol2;
      
      text = `[ SINCERITY FAIL 😇 ]

${primeName} offered: "${apol1}".
${p2Apol} offered: "${apol2}".

Verdict: ${faker} is an absolute sociopath. "${fakeApology}" is the most manipulative, fake apology this AI has ever processed. ${faker}, you wouldn't know accountability if it ran you over. The other person wins by default, even though they're probably toxic too.`;
      break;

    case 'text-energy':
      const style1 = inputs['style1'] || 'double text';
      const style2 = inputs['style2'] || 'dry';
      const p2Text = players[1] || 'Player 2';
      const desperate = Math.random() > 0.5 ? primeName : p2Text;

      text = `[ DESPERATION METRICS 📱 ]

${primeName} claims: "${style1}".
${p2Text} claims: "${style2}".

Verdict: ${desperate} is radiating weaponized desperation. You are the person fighting for your life in the iMessage chat while the other person is literally playing Fortnite. Both of you lack communication skills, but ${desperate} needs to put the phone down immediately.`;
      break;

    case 'hot-seat':
      const target = inputs['target'] || 'Someone';
      const words = inputs['words'] || 'weird, funny, chill';
      text = `[ GROUP VERDICT 🪑 ]

The council has spoken. They described ${target} as: ${words}.

${target}, the fact that your own friends view you this way means you should probably reconsider the entire group dynamic. Let's be real: they only keep you around to feel better about their own miserable lives. You're basically the emotional support clown. Pathetic.`;
      break;

    case 'most-likely-to':
      const playerList = players.length > 0 ? players : ['Dave', 'Sarah', 'Mike'];
      const chosen = playerList[Math.floor(Math.random() * playerList.length)];
      const scenarios = [
        "get scammed buying fake crypto",
        "accidentally like their ex's photo from 2017",
        "drop their phone in a toilet while watching TikToks",
        "get entirely ghosted and still think they have a chance",
        "cry over a fictional character's death while ignoring their real-life responsibilities"
      ];
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      text = `[ PREDICTION SECURED 🏆 ]

Scanning the group... ${playerList.join(', ')}...

Verdict: ${chosen} is MOST LIKELY TO ${scenario}. 

Why? Because ${chosen} projects intense "I have zero survival instincts" energy. The rest of you are barely functional, but ${chosen} is a walking disaster waiting to happen. Please assign them an adult supervisor.`;
      break;

    default:
      text = `[ SYSTEM ERROR ]\n\nYou broke the AI. You're so cringe the algorithm stopped running. Go home.`;
  }

  return { text, percentage: percent };
}
