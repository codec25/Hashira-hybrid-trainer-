(function(){
  const RANKS = [
    {name:'Initiate', min:0}, {name:'Apprentice', min:350}, {name:'Slayer', min:1100},
    {name:'Hashira', min:2600}, {name:'Kenshin', min:5200}, {name:'Tokito', min:8200}, {name:'Legend', min:12000}
  ];

  const VERSES = [
    { text: 'Be strong and courageous... for the LORD your God will be with you wherever you go.', ref: 'Joshua 1:9' },
    { text: 'I can do all things through Christ who strengthens me.', ref: 'Philippians 4:13' },
    { text: 'Let us not grow weary of doing good... we will reap if we do not give up.', ref: 'Galatians 6:9' },
    { text: 'The LORD is my strength and my shield; my heart trusts in Him.', ref: 'Psalm 28:7' },
    { text: 'Trust in the LORD with all your heart... and He will make your paths straight.', ref: 'Proverbs 3:5-6' },
    { text: 'God has not given us a spirit of fear, but of power and love and a sound mind.', ref: '2 Timothy 1:7' }
  ];

  const DISCIPLINES_ALL = [
    {value:'calisthenics', label:'Calisthenics'},
    {value:'gym', label:'Gym (weights)'},
    {value:'breakdance', label:'Breakdance'},
    {value:'parkour', label:'Parkour'},
    {value:'pilates', label:'Pilates (mat)'}
  ];

  const DAY_TYPES = {
    calisthenics: [
      {value:'push', label:'Push'}, {value:'pull', label:'Pull'}, {value:'legs', label:'Legs'},
      {value:'skill', label:'Skill'}, {value:'conditioning', label:'Conditioning'}, {value:'shoulder', label:'Shoulder Care'}
    ],
    gym: [
      {value:'upper', label:'Upper'}, {value:'lower', label:'Lower'}, {value:'push', label:'Push'},
      {value:'pull', label:'Pull'}, {value:'legs', label:'Legs'}, {value:'conditioning', label:'Conditioning'}, {value:'shoulder', label:'Shoulder Prehab'}
    ],
    breakdance: [
      {value:'toprock', label:'Toprock'}, {value:'footwork', label:'Footwork'}, {value:'freezes', label:'Freezes'},
      {value:'power', label:'Power / Explosive'}, {value:'conditioning', label:'Conditioning'}, {value:'shoulder', label:'Wrists/Shoulders'}
    ],
    parkour: [
      {value:'landing', label:'Landing Mechanics'}, {value:'vaults', label:'Vaults'}, {value:'jumps', label:'Jumps & Precision'},
      {value:'flow', label:'Flow / Lines'}, {value:'conditioning', label:'Conditioning'}, {value:'mobility', label:'Mobility & Prehab'}
    ],
    pilates: [
      {value:'core', label:'Core & Control'}, {value:'lower', label:'Lower Body'}, {value:'upper', label:'Upper Body'},
      {value:'mobility', label:'Mobility / Spine'}, {value:'glutes', label:'Glutes & Hips'}, {value:'full', label:'Full Body Flow'}
    ]
  };

  const CAT = {
    STRENGTH: 'Strength',
    HYPER: 'Hypertrophy',
    SKILL: 'Skill',
    POWER: 'Power',
    COND: 'Conditioning',
    PREHAB: 'Prehab'
  };

  function makeLevels(block) {
    return {
      beginner: block.beginner,
      intermediate: block.intermediate,
      advanced: block.advanced
    };
  }

  function ytLink(query) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} tutorial`)}`;
  }

  function ex(key, name, note, tag, cat, equip, query) {
    return { key, name, note, tag, cat, equip, url: ytLink(query || name) };
  }

  const LIB = {
    moise: {
      calisthenics: makeLevels({
        beginner: {
          push:[
            ex('p_std','Incline Push-Up','3 x 8-15 clean','WORK',CAT.HYPER,['bw'],'incline push up form'),
            ex('p_std','Push-Up','3 x 6-12 clean','WORK',CAT.HYPER,['bw'],'push up proper form'),
            ex('p_std','Knee Pike Push-Up','3 x 6-10','WORK',CAT.STRENGTH,['bw'],'pike push up progression'),
            ex('plnk','Scapular Push-Up','2-3 x 8-12','SHOULDER',CAT.PREHAB,['bw'],'scapular push up')
          ],
          pull:[
            ex('p_up','Australian Row','3 x 8-12','WORK',CAT.HYPER,['bar'],'australian row form'),
            ex('p_up','Negative Pull-Up','3 x 3-6 (3-5s lowering)','WORK',CAT.STRENGTH,['bar'],'negative pull up'),
            ex('p_up','Band-Assisted Pull-Up','3 x 5-8','WORK',CAT.STRENGTH,['bar'],'assisted pull up band'),
            ex('plnk','Dead Hang','3 x 20-40s','SKILL',CAT.PREHAB,['bar'],'dead hang shoulder health')
          ],
          legs:[
            ex('sq_std','Bodyweight Squat','3 x 10-20','WORK',CAT.HYPER,['bw'],'bodyweight squat form'),
            ex('sq_std','Reverse Lunge','3 x 8-12/side','WORK',CAT.HYPER,['bw'],'reverse lunge form'),
            ex('sq_std','Hip Hinge Drill','3 x 10-15','SKILL',CAT.SKILL,['bw'],'hip hinge drill'),
            ex('plnk','Calf Raise','3 x 12-20','WORK',CAT.HYPER,['bw'],'calf raise technique')
          ],
          skill:[
            ex('plnk','Hollow Body Hold','3 x 15-30s','SKILL',CAT.SKILL,['bw'],'hollow body hold'),
            ex('plnk','Arch Hold','3 x 15-30s','SKILL',CAT.SKILL,['bw'],'superman arch hold'),
            ex('plnk','Wall Handstand Walk-In','4-8 attempts','SKILL',CAT.SKILL,['bw'],'wall handstand walk in'),
            ex('plnk','Support Hold on Parallel Bars','3 x 15-30s','SKILL',CAT.SKILL,['bw'],'parallel bar support hold')
          ],
          conditioning:[
            ex('plnk','Mountain Climbers','30-45s','WORK',CAT.COND,['bw'],'mountain climber form'),
            ex('plnk','Jumping Jacks','45-60s','WORK',CAT.COND,['bw'],'jumping jacks technique'),
            ex('plnk','Bear Crawl','20-40m','WORK',CAT.COND,['bw'],'bear crawl exercise'),
            ex('plnk','Burpee Step-Back','6-12 reps','WORK',CAT.COND,['bw'],'beginner burpee')
          ],
          shoulder:[
            ex('plnk','Wall Slides','2-3 x 10-15','SHOULDER',CAT.PREHAB,['bw'],'wall slides shoulder mobility'),
            ex('plnk','Prone Y-T-W','2 x 8 each','SHOULDER',CAT.PREHAB,['bw'],'prone ytw shoulder'),
            ex('plnk','Banded External Rotation','2-3 x 12-15','SHOULDER',CAT.PREHAB,['bw'],'band external rotation shoulder'),
            ex('plnk','Thoracic Extension on Floor','60-90s','SHOULDER',CAT.PREHAB,['bw'],'thoracic extension mobility')
          ]
        },
        intermediate: {
          push:[
            ex('p_std','Push-Up','4 x 8-15','WORK',CAT.HYPER,['bw'],'push up form'),
            ex('p_std','Decline Push-Up','3-4 x 6-12','WORK',CAT.STRENGTH,['bw'],'decline push up'),
            ex('p_std','Pike Push-Up','3-4 x 6-10','WORK',CAT.STRENGTH,['bw'],'pike push up'),
            ex('p_std','Ring Push-Up','3 x 6-10','WORK',CAT.STRENGTH,['rings'],'ring push up')
          ],
          pull:[
            ex('p_up','Pull-Up','4 x 3-8','WORK',CAT.STRENGTH,['bar'],'pull up strict form'),
            ex('p_up','Chin-Up','3-4 x 4-8','WORK',CAT.STRENGTH,['bar'],'chin up technique'),
            ex('p_up','Inverted Row Feet-Elevated','3 x 6-12','WORK',CAT.HYPER,['bar'],'feet elevated row'),
            ex('p_up','Scap Pull-Up','3 x 6-10','SKILL',CAT.SKILL,['bar'],'scap pull up')
          ],
          legs:[
            ex('sq_std','Bulgarian Split Squat','3-4 x 8-12/side','WORK',CAT.HYPER,['bw'],'bulgarian split squat bodyweight'),
            ex('sq_std','Cossack Squat','3 x 6-10/side','SKILL',CAT.SKILL,['bw'],'cossack squat'),
            ex('sq_std','Single-Leg RDL','3 x 8-12/side','WORK',CAT.HYPER,['bw'],'single leg rdl bodyweight'),
            ex('plnk','Broad Jump (stick landing)','4-8 reps','WORK',CAT.POWER,['bw'],'broad jump landing')
          ],
          skill:[
            ex('plnk','Wall Handstand Hold','4 x 20-40s','SKILL',CAT.SKILL,['bw'],'wall handstand hold'),
            ex('plnk','L-Sit Tuck Hold','4 x 10-20s','SKILL',CAT.SKILL,['bw'],'l sit tuck progression'),
            ex('plnk','Hollow to Arch Rocks','3 x 10-20','SKILL',CAT.SKILL,['bw'],'hollow to arch rocks'),
            ex('plnk','Crow Stand','4-8 attempts','SKILL',CAT.SKILL,['bw'],'crow pose balance')
          ],
          conditioning:[
            ex('plnk','Burpee','8-15 reps','WORK',CAT.COND,['bw'],'burpee form'),
            ex('plnk','High Knees','30-45s','WORK',CAT.COND,['bw'],'high knees drill'),
            ex('plnk','Skater Jumps','20-40 reps','WORK',CAT.COND,['bw'],'skater jumps'),
            ex('plnk','EMOM Push/Pull Mix','8-12 min','WORK',CAT.COND,['bw'],'calisthenics emom workout')
          ],
          shoulder:[
            ex('plnk','Wall Angels','2-3 x 10-15','SHOULDER',CAT.PREHAB,['bw'],'wall angels exercise'),
            ex('plnk','Band Pull-Apart','2-3 x 12-20','SHOULDER',CAT.PREHAB,['bw'],'band pull apart'),
            ex('plnk','Scapular CARs','2 x 5/side','SHOULDER',CAT.PREHAB,['bw'],'scapular cars'),
            ex('plnk','Wrist Prep Flow','2-3 min','SHOULDER',CAT.PREHAB,['bw'],'wrist mobility routine')
          ]
        },
        advanced: {
          push:[
            ex('p_std','Ring Push-Up (deep)','4 x 6-12','WORK',CAT.STRENGTH,['rings'],'deep ring push up'),
            ex('p_std','Pseudo Planche Push-Up','4 x 4-8','WORK',CAT.STRENGTH,['bw'],'pseudo planche push up'),
            ex('p_std','Deficit Pike Push-Up','4 x 5-8','WORK',CAT.STRENGTH,['bw'],'deficit pike push up'),
            ex('p_std','Handstand Push-Up Negative','4 x 2-5','SKILL',CAT.SKILL,['bw'],'handstand push up negative')
          ],
          pull:[
            ex('p_up','Pull-Up (weighted if possible)','5 x 3-6','WORK',CAT.STRENGTH,['bar'],'weighted pull up'),
            ex('p_up','Archer Pull-Up','4 x 3-6/side','WORK',CAT.STRENGTH,['bar'],'archer pull up progression'),
            ex('p_up','Typewriter Row','4 x 4-8','WORK',CAT.STRENGTH,['rings'],'typewriter row rings'),
            ex('p_up','Front Lever Tuck Hold','4 x 8-15s','SKILL',CAT.SKILL,['bar'],'front lever tuck')
          ],
          legs:[
            ex('sq_std','Pistol Squat to Box','4 x 4-8/side','SKILL',CAT.SKILL,['bw'],'pistol squat progression'),
            ex('sq_std','Shrimp Squat','4 x 4-8/side','SKILL',CAT.SKILL,['bw'],'shrimp squat progression'),
            ex('sq_std','Nordic Hamstring Eccentric','4 x 3-6','WORK',CAT.STRENGTH,['bw'],'nordic curl eccentric'),
            ex('plnk','Box Jump (stick landing)','5 x 3-5','WORK',CAT.POWER,['bw'],'box jump landing mechanics')
          ],
          skill:[
            ex('plnk','Freestanding Handstand Practice','8-15 attempts','SKILL',CAT.SKILL,['bw'],'freestanding handstand'),
            ex('plnk','L-Sit','5 x 10-20s','SKILL',CAT.SKILL,['bw'],'l sit tutorial'),
            ex('plnk','Back Lever Tuck','4 x 6-12s','SKILL',CAT.SKILL,['bar'],'back lever tuck'),
            ex('plnk','Muscle-Up Transition Drill','4 x 3-6','SKILL',CAT.SKILL,['bar'],'muscle up transition drill')
          ],
          conditioning:[
            ex('plnk','Sprint Intervals','6-10 rounds x 15-30s','WORK',CAT.COND,['bw'],'sprint interval training'),
            ex('plnk','Burpee Pull-Up','6-12 reps','WORK',CAT.COND,['bar'],'burpee pull up'),
            ex('plnk','Jump Lunge','20-40 reps','WORK',CAT.COND,['bw'],'jump lunge form'),
            ex('plnk','Tabata Climbers','8 rounds x 20/10','WORK',CAT.COND,['bw'],'tabata mountain climbers')
          ],
          shoulder:[
            ex('plnk','Wall Handstand Shoulder Taps','3-5 x 8-16','SHOULDER',CAT.PREHAB,['bw'],'wall handstand shoulder taps'),
            ex('plnk','YTWL','2-3 x 8 each','SHOULDER',CAT.PREHAB,['bw'],'ytwl shoulder routine'),
            ex('plnk','Band Face Pull + External Rotation','2-3 x 12-15','SHOULDER',CAT.PREHAB,['bw'],'face pull external rotation'),
            ex('plnk','Forearm/Wrist Extensor Work','2-3 x 15-20','SHOULDER',CAT.PREHAB,['bw'],'wrist extensor exercise')
          ]
        }
      }),
      gym: makeLevels({
        beginner: {
          upper:[
            ex('p_std','Dumbbell Bench Press','3 x 8-12','WORK',CAT.HYPER,['db'],'dumbbell bench press form'),
            ex('p_up','Lat Pulldown','3 x 8-12','WORK',CAT.HYPER,['machine'],'lat pulldown form'),
            ex('p_up','Seated Cable Row','3 x 8-12','WORK',CAT.HYPER,['machine'],'seated cable row form'),
            ex('p_std','Dumbbell Shoulder Press','3 x 8-12','WORK',CAT.HYPER,['db'],'seated dumbbell shoulder press')
          ],
          lower:[
            ex('sq_std','Goblet Squat','3 x 8-12','WORK',CAT.HYPER,['db'],'goblet squat form'),
            ex('sq_std','Romanian Deadlift (DB)','3 x 8-12','WORK',CAT.HYPER,['db'],'dumbbell romanian deadlift'),
            ex('sq_std','Leg Press','3 x 10-15','WORK',CAT.HYPER,['machine'],'leg press proper form'),
            ex('sq_std','Walking Lunge','3 x 8-12/side','WORK',CAT.HYPER,['db'],'walking lunges form')
          ],
          push:[
            ex('p_std','Machine Chest Press','3 x 10-15','WORK',CAT.HYPER,['machine'],'machine chest press'),
            ex('p_std','Incline DB Press','3 x 8-12','WORK',CAT.HYPER,['db'],'incline dumbbell press'),
            ex('p_std','Cable Fly','2-3 x 10-15','WORK',CAT.HYPER,['machine'],'cable chest fly'),
            ex('p_std','Triceps Rope Pushdown','2-3 x 10-15','WORK',CAT.HYPER,['machine'],'rope triceps pushdown')
          ],
          pull:[
            ex('p_up','Assisted Pull-Up Machine','3 x 6-10','WORK',CAT.STRENGTH,['machine'],'assisted pull up machine'),
            ex('p_up','Seated Row (machine)','3 x 8-12','WORK',CAT.HYPER,['machine'],'machine seated row'),
            ex('p_up','One-Arm DB Row','3 x 8-12/side','WORK',CAT.HYPER,['db'],'one arm dumbbell row form'),
            ex('p_up','Cable Face Pull','2-3 x 12-20','SHOULDER',CAT.PREHAB,['machine'],'cable face pull')
          ],
          legs:[
            ex('sq_std','Hack Squat or Leg Press','3 x 8-12','WORK',CAT.HYPER,['machine'],'hack squat form'),
            ex('sq_std','DB Romanian Deadlift','3 x 8-12','WORK',CAT.HYPER,['db'],'db rdl'),
            ex('sq_std','Leg Curl Machine','3 x 10-15','WORK',CAT.HYPER,['machine'],'leg curl machine form'),
            ex('sq_std','Standing Calf Raise','3 x 12-20','WORK',CAT.HYPER,['machine'],'standing calf raise')
          ],
          conditioning:[
            ex('plnk','Assault Bike Intervals','8-12 min','WORK',CAT.COND,['machine'],'air bike intervals'),
            ex('plnk','Treadmill Incline Walk','10-20 min','WORK',CAT.COND,['machine'],'incline treadmill walk'),
            ex('plnk','Row Erg Steady','8-15 min','WORK',CAT.COND,['machine'],'rowing machine technique'),
            ex('plnk','Sled Push (light)','6-10 rounds','WORK',CAT.COND,['machine'],'sled push technique')
          ],
          shoulder:[
            ex('plnk','Face Pull (light)','2-3 x 12-20','SHOULDER',CAT.PREHAB,['machine'],'face pull form'),
            ex('plnk','Cable External Rotation','2-3 x 12-15','SHOULDER',CAT.PREHAB,['machine'],'cable external rotation shoulder'),
            ex('plnk','Scaption Raise','2-3 x 12-15','SHOULDER',CAT.PREHAB,['db'],'dumbbell scaption'),
            ex('plnk','Thoracic Mobility Drill','2-3 min','SHOULDER',CAT.PREHAB,['bw'],'thoracic spine mobility')
          ]
        },
        intermediate: {
          upper:[
            ex('p_std','DB Bench Press','4 x 6-10','WORK',CAT.STRENGTH,['db'],'db bench press form'),
            ex('p_up','Seated Row','4 x 8-12','WORK',CAT.HYPER,['machine'],'seated cable row'),
            ex('p_up','Lat Pulldown','4 x 6-10','WORK',CAT.STRENGTH,['machine'],'lat pulldown proper form'),
            ex('p_std','DB Shoulder Press','3-4 x 8-12','WORK',CAT.HYPER,['db'],'db shoulder press')
          ],
          lower:[
            ex('sq_std','DB Front Foot Elevated Split Squat','4 x 8-12/side','WORK',CAT.HYPER,['db'],'front foot elevated split squat'),
            ex('sq_std','Romanian Deadlift (DB)','4 x 6-10','WORK',CAT.STRENGTH,['db'],'romanian deadlift dumbbells'),
            ex('sq_std','Leg Press (hard set)','4 x 10-15','WORK',CAT.HYPER,['machine'],'leg press workout'),
            ex('sq_std','Hamstring Curl','3-4 x 8-12','WORK',CAT.HYPER,['machine'],'hamstring curl form')
          ],
          push:[
            ex('p_std','Incline DB Press','4 x 6-10','WORK',CAT.STRENGTH,['db'],'incline dumbbell press form'),
            ex('p_std','Machine Chest Press','3-4 x 8-12','WORK',CAT.HYPER,['machine'],'machine chest press setup'),
            ex('p_std','DB Lateral Raise','3-4 x 10-20','WORK',CAT.HYPER,['db'],'lateral raise strict form'),
            ex('p_std','Overhead Triceps Extension (DB)','3 x 10-15','WORK',CAT.HYPER,['db'],'overhead dumbbell triceps extension')
          ],
          pull:[
            ex('p_up','Pull-Up or Assisted Pull-Up','4 x 4-8','WORK',CAT.STRENGTH,['machine'],'pull up progression gym'),
            ex('p_up','Chest-Supported Row','4 x 8-12','WORK',CAT.HYPER,['machine'],'chest supported row'),
            ex('p_up','Single-Arm Lat Pulldown','3 x 8-12/side','WORK',CAT.HYPER,['machine'],'single arm lat pulldown'),
            ex('p_up','Hammer Curl','3 x 8-12','WORK',CAT.HYPER,['db'],'hammer curl form')
          ],
          legs:[
            ex('sq_std','Bulgarian Split Squat (DB)','3-4 x 8-12/side','WORK',CAT.HYPER,['db'],'bulgarian split squat dumbbell'),
            ex('sq_std','Hip Thrust','3-4 x 8-12','WORK',CAT.HYPER,['machine'],'hip thrust machine'),
            ex('sq_std','Leg Extension','3 x 10-15','WORK',CAT.HYPER,['machine'],'leg extension proper form'),
            ex('sq_std','Seated Calf Raise','3 x 12-20','WORK',CAT.HYPER,['machine'],'seated calf raise')
          ],
          conditioning:[
            ex('plnk','Row Intervals (250m repeats)','6-10 rounds','WORK',CAT.COND,['machine'],'rowing intervals workout'),
            ex('plnk','Bike Sprint Intervals','8-12 rounds','WORK',CAT.COND,['machine'],'stationary bike sprint intervals'),
            ex('plnk','Farmer Carry','6-10 x 20-40m','WORK',CAT.COND,['db'],'farmer carry form'),
            ex('plnk','Sled Push/Pull','8-12 rounds','WORK',CAT.COND,['machine'],'sled push pull workout')
          ],
          shoulder:[
            ex('plnk','External Rotation (cable or band)','2-3 x 12-20','SHOULDER',CAT.PREHAB,['bw'],'external rotation exercise shoulder'),
            ex('plnk','Face Pull + Y Raise','2-3 x 12-15','SHOULDER',CAT.PREHAB,['machine'],'face pull y raise'),
            ex('plnk','Serratus Wall Slide','2-3 x 10-15','SHOULDER',CAT.PREHAB,['bw'],'serratus wall slide'),
            ex('plnk','Prone Trap 3 Raise','2-3 x 10-15','SHOULDER',CAT.PREHAB,['db'],'trap 3 raise')
          ]
        },
        advanced: {
          upper:[
            ex('p_std','DB Bench Press (hard)','5 x 5-8','WORK',CAT.STRENGTH,['db'],'heavy dumbbell bench press'),
            ex('p_up','Heavy Row (machine)','5 x 6-10','WORK',CAT.STRENGTH,['machine'],'heavy machine row'),
            ex('p_up','Weighted Pull-Up / Heavy Pulldown','4-5 x 4-8','WORK',CAT.STRENGTH,['machine'],'weighted pull up gym'),
            ex('p_std','Seated DB Shoulder Press (heavy)','4 x 5-8','WORK',CAT.STRENGTH,['db'],'heavy seated dumbbell shoulder press')
          ],
          lower:[
            ex('sq_std','Split Squat (DB)','4 x 8-12/side','WORK',CAT.HYPER,['db'],'split squat dumbbells'),
            ex('sq_std','RDL (DB)','4 x 6-10','WORK',CAT.STRENGTH,['db'],'heavy db rdl'),
            ex('sq_std','Leg Press (hard)','4-5 x 10-15','WORK',CAT.HYPER,['machine'],'leg press hard sets'),
            ex('sq_std','Hip Thrust (heavy)','4 x 6-10','WORK',CAT.STRENGTH,['machine'],'heavy hip thrust')
          ],
          push:[
            ex('p_std','Push Press (DB)','4 x 5-8','WORK',CAT.POWER,['db'],'dumbbell push press'),
            ex('p_std','Incline DB Press (heavy)','4 x 6-10','WORK',CAT.STRENGTH,['db'],'heavy incline dumbbell press'),
            ex('p_std','Dips (assisted if needed)','4 x 6-10','WORK',CAT.STRENGTH,['machine'],'dip exercise form'),
            ex('p_std','Cable Chest Fly (stretch focus)','3 x 10-15','WORK',CAT.HYPER,['machine'],'cable chest fly technique')
          ],
          pull:[
            ex('p_up','Weighted Pull-Up or Pulldown (hard)','5 x 5-8','WORK',CAT.STRENGTH,['machine'],'weighted pull up tutorial'),
            ex('p_up','Chest-Supported Row (heavy)','4 x 6-10','WORK',CAT.STRENGTH,['machine'],'heavy chest supported row'),
            ex('p_up','Meadows Row (DB landmine alt)','3-4 x 6-10','WORK',CAT.STRENGTH,['db'],'meadows row form'),
            ex('p_up','Rear Delt Fly','3-4 x 12-20','SHOULDER',CAT.PREHAB,['db'],'rear delt fly dumbbell')
          ],
          legs:[
            ex('sq_std','Walking Lunge (heavy DB)','4 x 8-12/side','WORK',CAT.HYPER,['db'],'heavy walking lunge'),
            ex('sq_std','Step-Up (DB)','4 x 8-12/side','WORK',CAT.HYPER,['db'],'dumbbell step up form'),
            ex('sq_std','Leg Curl (heavy)','4 x 8-12','WORK',CAT.HYPER,['machine'],'heavy leg curl'),
            ex('sq_std','Standing Calf Raise (slow)','4 x 10-20','WORK',CAT.HYPER,['machine'],'standing calf raise proper form')
          ],
          conditioning:[
            ex('plnk','Row Sprint','10-15 rounds x 20-40s','WORK',CAT.COND,['machine'],'rowing sprint intervals'),
            ex('plnk','Bike Sprint','10-15 rounds x 15-30s','WORK',CAT.COND,['machine'],'air bike sprint intervals'),
            ex('plnk','Sled Push (heavy)','8-12 rounds','WORK',CAT.COND,['machine'],'heavy sled push'),
            ex('plnk','Farmer Carry Heavy','8-12 x 20-30m','WORK',CAT.COND,['db'],'heavy farmer carry')
          ],
          shoulder:[
            ex('plnk','Rear Delt Fly','3 x 12-20','SHOULDER',CAT.PREHAB,['db'],'rear delt fly form'),
            ex('plnk','Cable External Rotation 90/90','3 x 10-15','SHOULDER',CAT.PREHAB,['machine'],'90 90 shoulder external rotation'),
            ex('plnk','Face Pull (strict)','3 x 12-20','SHOULDER',CAT.PREHAB,['machine'],'strict face pull'),
            ex('plnk','Bottom-Up Carry (KB/DB alt)','3-4 x 20-30m','SHOULDER',CAT.PREHAB,['db'],'bottom up carry shoulder stability')
          ]
        }
      }),
      breakdance: makeLevels({
        beginner: {
          toprock:[
            ex('warm','Indian Step','45-60s','SKILL',CAT.SKILL,['bw'],'indian step breakdance tutorial'),
            ex('warm','Side Step Toprock','45-60s','SKILL',CAT.SKILL,['bw'],'side step toprock'),
            ex('warm','Kick Step Toprock','45-60s','SKILL',CAT.SKILL,['bw'],'kick step toprock tutorial'),
            ex('warm','Cross Step Toprock','45-60s','SKILL',CAT.SKILL,['bw'],'cross step toprock')
          ],
          footwork:[
            ex('plnk','6-Step (slow)','6-12 rounds','SKILL',CAT.SKILL,['bw'],'6 step breakdance tutorial'),
            ex('plnk','CCs','6-12/side','SKILL',CAT.SKILL,['bw'],'cc breakdance footwork'),
            ex('plnk','Kick Outs','8-16 total','SKILL',CAT.SKILL,['bw'],'breakdance kick out'),
            ex('plnk','3-Step Drill','6-12 rounds','SKILL',CAT.SKILL,['bw'],'3 step bboy drill')
          ],
          freezes:[
            ex('plnk','Baby Freeze','6-12 attempts','SKILL',CAT.SKILL,['bw'],'baby freeze tutorial'),
            ex('plnk','Chair Freeze Prep','6-10 attempts','SKILL',CAT.SKILL,['bw'],'chair freeze progression'),
            ex('plnk','Turtle Freeze Prep','6-10 attempts','SKILL',CAT.SKILL,['bw'],'turtle freeze tutorial'),
            ex('plnk','Headstand Base (safe)','20-40s','SKILL',CAT.SKILL,['bw'],'headstand beginner tutorial')
          ],
          power:[
            ex('plnk','Power Step Through','20-40s','WORK',CAT.POWER,['bw'],'power step breakdance'),
            ex('plnk','Donkey Kick Hop','6-12 reps','WORK',CAT.POWER,['bw'],'donkey kick progression'),
            ex('plnk','Swipe Entry Drill','6-12 attempts','WORK',CAT.POWER,['bw'],'swipes breakdance progression'),
            ex('plnk','Turtle Spin Prep','6-10 attempts','WORK',CAT.POWER,['bw'],'turtle spin tutorial')
          ],
          conditioning:[
            ex('plnk','Footwork Endurance Round','40-60s','WORK',CAT.COND,['bw'],'footwork endurance breakdance'),
            ex('plnk','Burpee to Sprawl','8-12 reps','WORK',CAT.COND,['bw'],'sprawl burpee'),
            ex('plnk','Jump Rope','60-90s','WORK',CAT.COND,['bw'],'jump rope technique'),
            ex('plnk','Core Hollow Hold','20-40s','WORK',CAT.COND,['bw'],'hollow hold core')
          ],
          shoulder:[
            ex('plnk','Wrist Circles','60-90s','SHOULDER',CAT.PREHAB,['bw'],'wrist circles warm up'),
            ex('plnk','Palm Pulses','2 x 20','SHOULDER',CAT.PREHAB,['bw'],'wrist palm pulses'),
            ex('plnk','Scap Push-Up','2 x 10-15','SHOULDER',CAT.PREHAB,['bw'],'scap push up'),
            ex('plnk','Forearm Stretch','60-90s','SHOULDER',CAT.PREHAB,['bw'],'forearm stretching routine')
          ]
        },
        intermediate: {
          toprock:[
            ex('warm','Toprock Combo (3 moves)','45-75s','SKILL',CAT.SKILL,['bw'],'toprock combination tutorial'),
            ex('warm','Thread Toprock','45-60s','SKILL',CAT.SKILL,['bw'],'thread toprock'),
            ex('warm','Drop Step Variations','45-60s','SKILL',CAT.SKILL,['bw'],'drop step toprock'),
            ex('warm','Musicality Drill','60s','SKILL',CAT.SKILL,['bw'],'bboy musicality practice')
          ],
          footwork:[
            ex('plnk','6-Step (faster)','8-16 rounds','SKILL',CAT.SKILL,['bw'],'fast 6 step bboy'),
            ex('plnk','2-Step + Sweep','8-12 rounds','SKILL',CAT.SKILL,['bw'],'2 step footwork bboy'),
            ex('plnk','Coffee Grinder','8-16 reps','SKILL',CAT.SKILL,['bw'],'coffee grinder tutorial'),
            ex('plnk','Zulu Spin Entry','6-10 reps','SKILL',CAT.SKILL,['bw'],'zulu spin breakdance')
          ],
          freezes:[
            ex('plnk','Baby Freeze Hold','10-25s','SKILL',CAT.SKILL,['bw'],'baby freeze hold'),
            ex('plnk','Chair Freeze Hold','8-20s','SKILL',CAT.SKILL,['bw'],'chair freeze hold'),
            ex('plnk','Elbow Freeze','6-12 attempts','SKILL',CAT.SKILL,['bw'],'elbow freeze tutorial'),
            ex('plnk','Headstand Freeze Transitions','6-10 attempts','SKILL',CAT.SKILL,['bw'],'headstand freeze transitions')
          ],
          power:[
            ex('plnk','Swipe','6-12 reps','WORK',CAT.POWER,['bw'],'breakdance swipe tutorial'),
            ex('plnk','Backspin','6-12 reps','WORK',CAT.POWER,['bw'],'backspin breakdance tutorial'),
            ex('plnk','Windmill Entry Drill','6-10 attempts','WORK',CAT.POWER,['bw'],'windmill entry tutorial'),
            ex('plnk','Turtle Turn','6-12 attempts','WORK',CAT.POWER,['bw'],'turtle turn breakdance')
          ],
          conditioning:[
            ex('plnk','Round Simulation','60-90s','WORK',CAT.COND,['bw'],'breakdance round training'),
            ex('plnk','Plyo Push-Up','6-12 reps','WORK',CAT.COND,['bw'],'plyometric push up form'),
            ex('plnk','V-Up','12-20 reps','WORK',CAT.COND,['bw'],'v up abs tutorial'),
            ex('plnk','Squat Jump','12-20 reps','WORK',CAT.COND,['bw'],'squat jump exercise')
          ],
          shoulder:[
            ex('plnk','Wrist Push-Up (gentle)','6-12 reps','SHOULDER',CAT.PREHAB,['bw'],'wrist push up progression'),
            ex('plnk','Forearm Pronation/Supination','2 x 12-20','SHOULDER',CAT.PREHAB,['bw'],'forearm pronation supination'),
            ex('plnk','Serratus Plank','2 x 20-40s','SHOULDER',CAT.PREHAB,['bw'],'serratus plank'),
            ex('plnk','Thoracic Rotation Drill','2 x 8-12/side','SHOULDER',CAT.PREHAB,['bw'],'thoracic rotation mobility')
          ]
        },
        advanced: {
          toprock:[
            ex('warm','Advanced Toprock Combo','60-90s','SKILL',CAT.SKILL,['bw'],'advanced toprock combo'),
            ex('warm','Tempo Change Toprock','60s','SKILL',CAT.SKILL,['bw'],'toprock tempo change'),
            ex('warm','Creative Threads','60s','SKILL',CAT.SKILL,['bw'],'bboy thread variations'),
            ex('warm','Battle Entry Drill','30-45s','SKILL',CAT.SKILL,['bw'],'battle entry breakdance')
          ],
          footwork:[
            ex('plnk','Fast 6-Step','12-24 rounds','SKILL',CAT.SKILL,['bw'],'fast 6 step'),
            ex('plnk','7-Step / 8-Step','8-16 rounds','SKILL',CAT.SKILL,['bw'],'7 step breakdance tutorial'),
            ex('plnk','Spider Footwork','8-12 rounds','SKILL',CAT.SKILL,['bw'],'spider footwork bboy'),
            ex('plnk','Thread Combos on Beat','60s','SKILL',CAT.SKILL,['bw'],'breakdance thread combo')
          ],
          freezes:[
            ex('plnk','Chair Freeze (clean hold)','10-20s','SKILL',CAT.SKILL,['bw'],'chair freeze tutorial'),
            ex('plnk','Airbaby Prep','6-10 attempts','SKILL',CAT.SKILL,['bw'],'airbaby freeze progression'),
            ex('plnk','Hollowback Freeze Prep','6-10 attempts','SKILL',CAT.SKILL,['bw'],'hollowback freeze progression'),
            ex('plnk','Headstand to Freeze Combo','6-10 attempts','SKILL',CAT.SKILL,['bw'],'headstand freeze combo')
          ],
          power:[
            ex('plnk','Windmill','6-12 reps','WORK',CAT.POWER,['bw'],'windmill tutorial breakdance'),
            ex('plnk','Swipe to Freeze','6-12 reps','WORK',CAT.POWER,['bw'],'swipe to freeze combo'),
            ex('plnk','Flare Prep','6-10 attempts','WORK',CAT.POWER,['bw'],'flare progression breakdance'),
            ex('plnk','1990 Entry Drill','4-8 attempts','WORK',CAT.POWER,['bw'],'1990 breakdance progression')
          ],
          conditioning:[
            ex('plnk','Battle Rounds','3-6 x 60-90s','WORK',CAT.COND,['bw'],'breakdance battle training rounds'),
            ex('plnk','Burpee Broad Jump','8-15 reps','WORK',CAT.COND,['bw'],'burpee broad jump'),
            ex('plnk','Hollow Rock','20-40s','WORK',CAT.COND,['bw'],'hollow body rock'),
            ex('plnk','Split Jump','20-30 reps','WORK',CAT.COND,['bw'],'split jump exercise')
          ],
          shoulder:[
            ex('plnk','Wrist Strength Circuit','60-120s','SHOULDER',CAT.PREHAB,['bw'],'wrist strengthening routine'),
            ex('plnk','Handstand Shoulder Shrug','3 x 8-15','SHOULDER',CAT.PREHAB,['bw'],'handstand shoulder shrug'),
            ex('plnk','Scapular Elevation/Depression','3 x 8-12','SHOULDER',CAT.PREHAB,['bw'],'scapular control drills'),
            ex('plnk','Rice Bucket Wrist Work','2-3 min','SHOULDER',CAT.PREHAB,['bw'],'rice bucket wrist training')
          ]
        }
      }),
      parkour: makeLevels({
        beginner: {
          landing:[
            ex('sq_std','Precision Landing (stick)','5 x 3-5 reps','SKILL',CAT.SKILL,['bw'],'parkour precision landing tutorial'),
            ex('sq_std','Two-Foot Drop Landing','4 x 3-5 reps','SKILL',CAT.SKILL,['bw'],'parkour drop landing beginner'),
            ex('plnk','Parkour Safety Roll (mat/grass)','6-12 reps/side','SKILL',CAT.SKILL,['bw'],'parkour safety roll tutorial'),
            ex('plnk','Balance Line Walk','4 x 20-40s','SKILL',CAT.SKILL,['bw'],'parkour balance training')
          ],
          vaults:[
            ex('plnk','Step Vault','8-16 reps','SKILL',CAT.SKILL,['bw'],'step vault tutorial'),
            ex('plnk','Safety Vault','8-16 reps','SKILL',CAT.SKILL,['bw'],'safety vault tutorial'),
            ex('plnk','Lazy Vault (low obstacle)','6-12 reps','SKILL',CAT.SKILL,['bw'],'lazy vault tutorial'),
            ex('plnk','Speed Vault (intro)','6-10 reps','SKILL',CAT.SKILL,['bw'],'speed vault tutorial')
          ],
          jumps:[
            ex('plnk','Standing Precision Jump','6-12 reps','SKILL',CAT.SKILL,['bw'],'standing precision jump parkour'),
            ex('plnk','Broad Jump + Stick','5 x 3 reps','WORK',CAT.POWER,['bw'],'broad jump with landing'),
            ex('plnk','Lateral Precision Jump','6-10 reps/side','SKILL',CAT.SKILL,['bw'],'lateral precision jump'),
            ex('plnk','Plyo Step-Up','3 x 8-12/side','WORK',CAT.POWER,['bw'],'plyometric step up')
          ],
          flow:[
            ex('warm','Run-Up + Step Vault + Stick','6-10 lines','SKILL',CAT.SKILL,['bw'],'parkour beginner line'),
            ex('warm','Balance + Drop + Roll Combo','6-10 lines','SKILL',CAT.SKILL,['bw'],'parkour combo drill beginner'),
            ex('warm','Jog + Precision Sequence','6-10 lines','SKILL',CAT.SKILL,['bw'],'parkour precision sequence'),
            ex('warm','Route Reading Drill','8-12 min','SKILL',CAT.SKILL,['bw'],'parkour route reading')
          ],
          conditioning:[
            ex('plnk','Quadrupedal Crawl','20-40m','WORK',CAT.COND,['bw'],'parkour quadrupedal movement'),
            ex('plnk','Box Step-Up Conditioning','3-5 x 45-60s','WORK',CAT.COND,['bw'],'box step up conditioning'),
            ex('plnk','Shuttle Run','6-10 rounds','WORK',CAT.COND,['bw'],'shuttle run technique'),
            ex('plnk','Tempo Jump Rope','4-8 min','WORK',CAT.COND,['bw'],'jump rope beginner workout')
          ],
          mobility:[
            ex('plnk','Ankle Dorsiflexion Drill','2-3 x 8-12','SHOULDER',CAT.PREHAB,['bw'],'ankle dorsiflexion mobility'),
            ex('plnk','Hip Airplane (assisted)','2-3 x 6-10/side','SHOULDER',CAT.PREHAB,['bw'],'hip airplane exercise'),
            ex('plnk','Wrist Prep (for vaults)','2-3 min','SHOULDER',CAT.PREHAB,['bw'],'wrist mobility for parkour'),
            ex('plnk','Calf + Achilles Mobility','2-3 min','SHOULDER',CAT.PREHAB,['bw'],'achilles mobility routine')
          ]
        },
        intermediate: {
          landing:[
            ex('sq_std','Drop Landing (higher box)','5 x 3-5 reps','SKILL',CAT.SKILL,['bw'],'parkour drop landing progression'),
            ex('plnk','Dive Roll Progression','6-10 reps','SKILL',CAT.SKILL,['bw'],'parkour dive roll tutorial'),
            ex('plnk','Cat Hang + Drop','6-12 reps','SKILL',CAT.SKILL,['bw'],'cat hang parkour drill'),
            ex('plnk','Rail Balance Transition','6-10 reps','SKILL',CAT.SKILL,['bw'],'rail balance parkour')
          ],
          vaults:[
            ex('plnk','Speed Vault','8-16 reps','SKILL',CAT.SKILL,['bw'],'speed vault parkour'),
            ex('plnk','Lazy Vault (flow)','8-12 reps','SKILL',CAT.SKILL,['bw'],'lazy vault progression'),
            ex('plnk','Kong Vault Prep','6-12 reps','SKILL',CAT.SKILL,['bw'],'kong vault progression'),
            ex('plnk','Dash Vault Intro','4-8 reps','SKILL',CAT.SKILL,['bw'],'dash vault tutorial')
          ],
          jumps:[
            ex('plnk','Running Precision Jump','6-10 reps','SKILL',CAT.SKILL,['bw'],'running precision jump parkour'),
            ex('plnk','Cat Leap (controlled)','6-10 reps','SKILL',CAT.SKILL,['bw'],'cat leap tutorial parkour'),
            ex('plnk','Stride Jump Progression','6-12 reps','WORK',CAT.POWER,['bw'],'stride jump parkour'),
            ex('plnk','Depth Jump (low)','4-8 reps','WORK',CAT.POWER,['bw'],'depth jump landing mechanics')
          ],
          flow:[
            ex('warm','Vault + Precision + Roll Line','6-10 lines','SKILL',CAT.SKILL,['bw'],'parkour intermediate line'),
            ex('warm','Wall Touch + Turn + Vault Line','6-10 lines','SKILL',CAT.SKILL,['bw'],'parkour wall line drill'),
            ex('warm','Time Trial Short Line','5-8 rounds','WORK',CAT.COND,['bw'],'parkour speed line training'),
            ex('warm','Creativity Constraint Line','10-15 min','SKILL',CAT.SKILL,['bw'],'parkour creativity drill')
          ],
          conditioning:[
            ex('plnk','Hill Sprint','6-10 rounds','WORK',CAT.COND,['bw'],'hill sprint technique'),
            ex('plnk','Bounding','3-5 x 20-30m','WORK',CAT.POWER,['bw'],'bounding drill running'),
            ex('plnk','Pull-Up + Dip Circuit','4-6 rounds','WORK',CAT.COND,['bar'],'parkour strength circuit'),
            ex('plnk','Bear Crawl Shuttle','4-8 rounds','WORK',CAT.COND,['bw'],'bear crawl shuttle')
          ],
          mobility:[
            ex('plnk','Hip Flexor Mobility','2-3 min','SHOULDER',CAT.PREHAB,['bw'],'hip flexor mobility routine'),
            ex('plnk','Deep Squat Hold + Reach','2-3 x 30-45s','SHOULDER',CAT.PREHAB,['bw'],'deep squat mobility'),
            ex('plnk','Thoracic Rotation','2-3 x 8-12/side','SHOULDER',CAT.PREHAB,['bw'],'thoracic rotation drill'),
            ex('plnk','Pogo Jumps (elastic prep)','3 x 20-30','SHOULDER',CAT.PREHAB,['bw'],'pogo jumps drill')
          ]
        },
        advanced: {
          landing:[
            ex('sq_std','Drop to Precision','5 x 3-5 reps','SKILL',CAT.SKILL,['bw'],'drop to precision parkour'),
            ex('plnk','Dive Roll Over Obstacle','6-10 reps','SKILL',CAT.SKILL,['bw'],'dive roll parkour advanced'),
            ex('plnk','Cat Leap to Climb-Up','6-10 reps','SKILL',CAT.SKILL,['bw'],'cat leap climb up'),
            ex('plnk','Rail Precision (narrow)','6-10 reps','SKILL',CAT.SKILL,['bw'],'rail precision parkour')
          ],
          vaults:[
            ex('plnk','Kong Vault','6-12 reps','SKILL',CAT.SKILL,['bw'],'kong vault tutorial parkour'),
            ex('plnk','Kong to Precision','4-8 reps','SKILL',CAT.SKILL,['bw'],'kong to precision'),
            ex('plnk','Dash Vault','6-10 reps','SKILL',CAT.SKILL,['bw'],'dash vault parkour'),
            ex('plnk','Reverse Vault (flow)','6-10 reps','SKILL',CAT.SKILL,['bw'],'reverse vault parkour')
          ],
          jumps:[
            ex('plnk','Running Precision (long)','6-10 reps','SKILL',CAT.SKILL,['bw'],'long running precision'),
            ex('plnk','Stride to Cat Leap','6-10 reps','SKILL',CAT.SKILL,['bw'],'stride to cat leap'),
            ex('plnk','Plyometric Bounds','4-6 x 20-30m','WORK',CAT.POWER,['bw'],'plyometric bounds training'),
            ex('plnk','Depth Drop to Bound','4-8 reps','WORK',CAT.POWER,['bw'],'depth drop to broad jump')
          ],
          flow:[
            ex('warm','Complex Urban Line','8-12 lines','SKILL',CAT.SKILL,['bw'],'advanced parkour line'),
            ex('warm','Flow Under Fatigue','6-10 lines','WORK',CAT.COND,['bw'],'parkour conditioning line'),
            ex('warm','One-Take Challenge Line','4-8 attempts','SKILL',CAT.SKILL,['bw'],'parkour one take line'),
            ex('warm','Route Adaptation Drill','12-20 min','SKILL',CAT.SKILL,['bw'],'parkour route adaptation')
          ],
          conditioning:[
            ex('plnk','Sprint Repeats','8-14 rounds','WORK',CAT.COND,['bw'],'sprint repeats workout'),
            ex('plnk','Plyo Push-Up + Precision Circuit','4-8 rounds','WORK',CAT.POWER,['bw'],'plyo push up circuit'),
            ex('plnk','Wall Run Repeats','6-12 reps','WORK',CAT.POWER,['bw'],'wall run parkour tutorial'),
            ex('plnk','Pull-Up + Jump Lunge EMOM','10-16 min','WORK',CAT.COND,['bar'],'emom workout pull up jump lunge')
          ],
          mobility:[
            ex('plnk','Ankle Stiffness Circuit','2-3 x 45-60s','SHOULDER',CAT.PREHAB,['bw'],'ankle stiffness plyometrics'),
            ex('plnk','Copenhagen Plank','2-3 x 15-30s/side','SHOULDER',CAT.PREHAB,['bw'],'copenhagen plank tutorial'),
            ex('plnk','Jefferson Curl (light)','2-3 x 6-10','SHOULDER',CAT.PREHAB,['bw'],'jefferson curl mobility'),
            ex('plnk','Wrist Extension Isometrics','2-3 x 20-30s','SHOULDER',CAT.PREHAB,['bw'],'wrist extension isometric')
          ]
        }
      }),
      pilates: null
    },
    her: {
      pilates: makeLevels({
        beginner: {
          core:[
            ex('plnk','The Hundred (prep)','30-60s (breathe 5-in/5-out)','SKILL',CAT.SKILL,['mat'],'pilates hundred beginner'),
            ex('plnk','Dead Bug','3 x 6-10/side','SKILL',CAT.SKILL,['mat'],'dead bug exercise'),
            ex('plnk','Toe Taps','3 x 8-12/side','SKILL',CAT.SKILL,['mat'],'pilates toe taps'),
            ex('plnk','Pelvic Curl','3 x 8-12','SKILL',CAT.SKILL,['mat'],'pilates pelvic curl')
          ],
          lower:[
            ex('sq_std','Side-Lying Leg Lifts','2-3 x 10-15/side','WORK',CAT.HYPER,['mat'],'side lying leg lifts pilates'),
            ex('sq_std','Clamshell','2-3 x 12-20/side','WORK',CAT.HYPER,['mat'],'pilates clamshell'),
            ex('sq_std','Standing Leg Series','2-3 x 8-12/side','WORK',CAT.HYPER,['mat'],'standing pilates leg series'),
            ex('sq_std','Pilates Squat Reach','2-3 x 8-12','WORK',CAT.HYPER,['mat'],'pilates squat')
          ],
          upper:[
            ex('p_std','Wall Push-Up','3 x 8-15','WORK',CAT.HYPER,['mat'],'wall push up proper form'),
            ex('plnk','Scapular Retraction Drill','2-3 x 10-15','SKILL',CAT.PREHAB,['mat'],'scapular retraction exercise'),
            ex('plnk','Kneeling Plank Shoulder Tap','2-3 x 8-12/side','WORK',CAT.STRENGTH,['mat'],'kneeling plank shoulder taps'),
            ex('plnk','Swan Prep','2-3 x 6-10','SKILL',CAT.SKILL,['mat'],'pilates swan prep')
          ],
          mobility:[
            ex('plnk','Cat-Cow','60-90s','REST',CAT.PREHAB,['mat'],'cat cow stretch'),
            ex('plnk','Spine Twist Supine','2 x 6-10/side','SKILL',CAT.SKILL,['mat'],'supine spine twist pilates'),
            ex('plnk','Child Pose Breathing','60-90s','REST',CAT.PREHAB,['mat'],'child pose breathing'),
            ex('plnk','Chest Opener Stretch','60-90s','REST',CAT.PREHAB,['mat'],'chest opener stretch floor')
          ],
          glutes:[
            ex('sq_std','Glute Bridge','3 x 10-15','WORK',CAT.HYPER,['mat'],'glute bridge form'),
            ex('sq_std','Bridge March','2-3 x 8-12/side','WORK',CAT.HYPER,['mat'],'bridge march exercise'),
            ex('sq_std','Donkey Kick (controlled)','2-3 x 8-12/side','WORK',CAT.HYPER,['mat'],'donkey kick form'),
            ex('sq_std','Fire Hydrant','2-3 x 10-15/side','WORK',CAT.HYPER,['mat'],'fire hydrant exercise')
          ],
          full:[
            ex('warm','Pilates Breathing','60s','SKILL',CAT.SKILL,['mat'],'pilates breathing basics'),
            ex('sq_std','Shoulder Bridge','10-15 reps','WORK',CAT.HYPER,['mat'],'pilates shoulder bridge'),
            ex('plnk','Single Leg Stretch','8-12/side','WORK',CAT.HYPER,['mat'],'single leg stretch pilates'),
            ex('plnk','Spine Stretch Forward','6-10 reps','SKILL',CAT.SKILL,['mat'],'spine stretch forward')
          ]
        },
        intermediate: {
          core:[
            ex('plnk','The Hundred','60-100 pumps','SKILL',CAT.SKILL,['mat'],'pilates hundred full'),
            ex('plnk','Roll-Up','6-10 reps','SKILL',CAT.SKILL,['mat'],'roll up pilates'),
            ex('plnk','Single Leg Stretch','8-12/side','WORK',CAT.HYPER,['mat'],'single leg stretch'),
            ex('plnk','Double Leg Stretch','6-10 reps','WORK',CAT.HYPER,['mat'],'double leg stretch pilates')
          ],
          lower:[
            ex('sq_std','Side Kick Series','2-3 x 8-12/side','WORK',CAT.HYPER,['mat'],'side kick series pilates'),
            ex('sq_std','Shoulder Bridge Single-Leg','2-3 x 6-10/side','SKILL',CAT.SKILL,['mat'],'single leg shoulder bridge pilates'),
            ex('sq_std','Leg Circles','2-3 x 6-10/side','SKILL',CAT.SKILL,['mat'],'pilates leg circles'),
            ex('sq_std','Wall Sit + Breath','3 x 30-45s','WORK',CAT.STRENGTH,['mat'],'wall sit breathing')
          ],
          upper:[
            ex('plnk','Pilates Plank','20-45s','WORK',CAT.STRENGTH,['mat'],'pilates plank'),
            ex('p_std','Push-Up (knees or full)','3 x 6-12','WORK',CAT.STRENGTH,['mat'],'pilates push up'),
            ex('plnk','Swan','2-3 x 6-10','SKILL',CAT.SKILL,['mat'],'pilates swan exercise'),
            ex('plnk','Dart','2-3 x 8-12','SKILL',CAT.SKILL,['mat'],'pilates dart')
          ],
          mobility:[
            ex('plnk','Spine Twist (seated)','2 x 6-10/side','SKILL',CAT.SKILL,['mat'],'seated spine twist pilates'),
            ex('plnk','Mermaid Stretch','2 x 30-45s/side','REST',CAT.PREHAB,['mat'],'pilates mermaid stretch'),
            ex('plnk','Hip Rolls','2 x 8-12','SKILL',CAT.SKILL,['mat'],'pilates hip rolls'),
            ex('plnk','Thoracic Reach','2 x 8-12/side','REST',CAT.PREHAB,['mat'],'thoracic reach mobility')
          ],
          glutes:[
            ex('sq_std','Side Plank Kneeling','2-3 x 20-35s/side','WORK',CAT.STRENGTH,['mat'],'side plank knee down'),
            ex('sq_std','Clamshell with Band','2-3 x 12-20/side','WORK',CAT.HYPER,['props'],'band clamshell exercise'),
            ex('sq_std','Bridge with Ball Squeeze','2-3 x 10-15','WORK',CAT.HYPER,['props'],'bridge with ball squeeze pilates'),
            ex('sq_std','Standing Hip Abduction','2-3 x 10-15/side','WORK',CAT.HYPER,['mat'],'standing hip abduction')
          ],
          full:[
            ex('warm','Pilates Breathing','60s','SKILL',CAT.SKILL,['mat'],'pilates breathing'),
            ex('plnk','Roll Like a Ball','6-10 reps','SKILL',CAT.SKILL,['mat'],'roll like a ball pilates'),
            ex('plnk','Leg Pull Front Prep','15-30s','WORK',CAT.STRENGTH,['mat'],'leg pull front prep'),
            ex('plnk','Saw','6-10 reps','SKILL',CAT.SKILL,['mat'],'pilates saw exercise')
          ]
        },
        advanced: {
          core:[
            ex('plnk','Teaser','3-8 reps','SKILL',CAT.SKILL,['mat'],'pilates teaser tutorial'),
            ex('plnk','Jackknife','3-6 reps','SKILL',CAT.SKILL,['mat'],'pilates jackknife'),
            ex('plnk','Boomerang Prep','3-6 reps','SKILL',CAT.SKILL,['mat'],'pilates boomerang progression'),
            ex('plnk','Control Balance Prep','3-6 reps','SKILL',CAT.SKILL,['mat'],'pilates control balance')
          ],
          lower:[
            ex('sq_std','Leg Pull Front (advanced plank)','15-30s','WORK',CAT.STRENGTH,['mat'],'leg pull front advanced'),
            ex('sq_std','Single Leg Kick','6-10/side','WORK',CAT.HYPER,['mat'],'single leg kick pilates'),
            ex('sq_std','Double Leg Kick','6-10 reps','WORK',CAT.HYPER,['mat'],'double leg kick pilates'),
            ex('sq_std','Scissor (advanced)','6-12/side','SKILL',CAT.SKILL,['mat'],'pilates scissors exercise')
          ],
          upper:[
            ex('p_std','Push-Up (Pilates style)','6-12 reps','WORK',CAT.STRENGTH,['mat'],'pilates push up advanced'),
            ex('plnk','Side Bend','6-10/side','WORK',CAT.STRENGTH,['mat'],'pilates side bend'),
            ex('plnk','Swan Dive Prep','3-6 reps','SKILL',CAT.SKILL,['mat'],'swan dive prep pilates'),
            ex('plnk','Plank to Pike (control)','6-10 reps','WORK',CAT.STRENGTH,['mat'],'plank to pike')
          ],
          mobility:[
            ex('plnk','Spine Stretch Forward','6-10 reps','SKILL',CAT.SKILL,['mat'],'spine stretch forward pilates'),
            ex('plnk','Open Leg Rocker Prep','4-8 reps','SKILL',CAT.SKILL,['mat'],'open leg rocker progression'),
            ex('plnk','Seal','6-10 reps','SKILL',CAT.SKILL,['mat'],'pilates seal'),
            ex('plnk','Hip Opener Flow','2-4 min','REST',CAT.PREHAB,['mat'],'hip opener flow')
          ],
          glutes:[
            ex('sq_std','Side Plank (full)','20-45s/side','WORK',CAT.STRENGTH,['mat'],'full side plank form'),
            ex('sq_std','Leg Pull Back Prep','15-30s','WORK',CAT.STRENGTH,['mat'],'leg pull back prep'),
            ex('sq_std','Bridge Walkout','6-10 reps','WORK',CAT.HYPER,['mat'],'glute bridge walkout'),
            ex('sq_std','Hip Twist in Side Plank','6-10/side','WORK',CAT.STRENGTH,['mat'],'side plank hip twist')
          ],
          full:[
            ex('warm','Pilates Breathing','60s','SKILL',CAT.SKILL,['mat'],'pilates breathing advanced'),
            ex('plnk','Leg Pull Front','15-30s','WORK',CAT.STRENGTH,['mat'],'leg pull front pilates'),
            ex('plnk','Corkscrew Prep','4-8 reps','SKILL',CAT.SKILL,['mat'],'pilates corkscrew progression'),
            ex('plnk','Swimming','30-45s','WORK',CAT.COND,['mat'],'pilates swimming exercise')
          ]
        }
      }),
      calisthenics: {},
      gym: {},
      breakdance: {},
      parkour: {}
    }
  };

  LIB.moise.pilates = LIB.her.pilates;
  LIB.her.parkour = LIB.moise.parkour;

  window.HASHIRA_LIB = {
    RANKS,
    VERSES,
    DISCIPLINES_ALL,
    DISCIPLINES_MOISE: DISCIPLINES_ALL,
    DISCIPLINES_HER: DISCIPLINES_ALL,
    DAY_TYPES,
    CAT,
    LIB
  };
})();
