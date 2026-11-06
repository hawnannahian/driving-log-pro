"use strict";
// Islamic Companion content. Text only — no logic — so it can be reviewed and corrected in one place.
// Rules for this file:
// - kind "quran" = Quran verse (ref = surah:verse); kind "hadith" = supplication taught in a hadith (ref = collection + number).
// - grade is filled in only for Sahih al-Bukhari / Sahih Muslim. Other collections show the reference without a grade.
// - Bengali meanings are meaning translations (ভাবানুবাদ), not word-for-word translations.
// - audio is set only when a real recording is in the app. Never add a file that has not been checked.
// STATUS: prepared from well-known sources; to be reviewed by the owner / a scholar before relying on it.
const ISLAMIC_DUAS=[
 {id:"vehicle",icon:"🚗",tags:["driving"],bn:"গাড়িতে ওঠার দোয়া",en:"Dua for entering a vehicle",kind:"quran",ref:"সূরা আয-যুখরুফ ৪৩:১৩–১৪",refEn:"Quran, Az-Zukhruf 43:13–14",audio:"travel-dua.mp3",audioLen:12,
  ar:"سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ",
  pr:"সুবহানাল্লাযী সাখখারা লানা হাযা, ওয়া মা কুন্না লাহু মুকরিনীন। ওয়া ইন্না ইলা রব্বিনা লামুনকালিবূন।",
  mbn:"পবিত্র ও মহান তিনি, যিনি এ বাহনকে আমাদের অধীন করে দিয়েছেন; অথচ আমরা নিজেরা একে বশীভূত করতে সক্ষম ছিলাম না। আর নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছেই ফিরে যাব।",
  men:"Glory be to the One who has placed this under our control, though we could never have done so on our own. And surely to our Lord we will return.",
  note:"হাদিসে আছে, আলী (রা.) বাহনে পা রাখার সময় “বিসমিল্লাহ” বলতেন, বসে “আলহামদুলিল্লাহ” বলে এই আয়াত পড়তেন (আবু দাউদ ২৬০২, তিরমিযি ৩৪৪৬)।"},
 {id:"home",icon:"🏠",tags:["driving","protection"],bn:"বাড়ি থেকে বের হওয়ার দোয়া",en:"Dua when leaving home",kind:"hadith",ref:"আবু দাউদ ৫০৯৫, তিরমিযি ৩৪২৬",refEn:"Abu Dawud 5095, Tirmidhi 3426",
  ar:"بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
  pr:"বিসমিল্লাহি, তাওয়াক্কালতু আলাল্লাহ, ওয়া লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ।",
  mbn:"আল্লাহর নামে (বের হচ্ছি)। আমি আল্লাহর উপর ভরসা করলাম। আল্লাহ ছাড়া কোনো ক্ষমতা ও শক্তি নেই।",
  men:"In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah."},
 {id:"journey",icon:"🛣️",tags:["driving"],bn:"দীর্ঘ সফরের দোয়া",en:"Dua for a long journey",kind:"hadith",ref:"সহিহ মুসলিম ১৩৪২",refEn:"Sahih Muslim 1342",grade:"সহিহ (মুসলিম)",
  ar:"اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ. سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى. اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ. اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ.",
  pr:"আল্লাহু আকবার, আল্লাহু আকবার, আল্লাহু আকবার। সুবহানাল্লাযী সাখখারা লানা হাযা ওয়া মা কুন্না লাহু মুকরিনীন, ওয়া ইন্না ইলা রব্বিনা লামুনকালিবূন। আল্লাহুম্মা ইন্না নাসআলুকা ফী সাফারিনা হাযাল বিররা ওয়াত তাকওয়া, ওয়া মিনাল আমালি মা তারদা। আল্লাহুম্মা হাওয়িন আলাইনা সাফারানা হাযা, ওয়াতবি আন্না বু‘দাহ। আল্লাহুম্মা আনতাস সাহিবু ফিস সাফারি, ওয়াল খালীফাতু ফিল আহল। আল্লাহুম্মা ইন্নী আঊযু বিকা মিন ওয়া‘সাইস সাফারি, ওয়া কাআবাতিল মানযারি, ওয়া সূইল মুনকালাবি ফিল মালি ওয়াল আহল।",
  mbn:"আল্লাহ সর্বশ্রেষ্ঠ—তিনবার। পবিত্র তিনি, যিনি এই বাহনকে আমাদের অধীন করেছেন; আমরা নিজেরা একে বশীভূত করতে পারতাম না। নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছেই ফিরে যাব। হে আল্লাহ, এই সফরে আমরা আপনার কাছে নেকি, তাকওয়া এবং আপনার পছন্দনীয় আমল চাই। আমাদের সফর সহজ করে দিন এবং এর দূরত্ব সংক্ষিপ্ত করে দিন। সফরে আপনিই আমাদের সঙ্গী এবং পরিবারে আমাদের স্থলাভিষিক্ত। সফরের কষ্ট, দুঃখজনক দৃশ্য এবং সম্পদ ও পরিবারের কাছে খারাপ অবস্থায় ফিরে আসা থেকে আপনার আশ্রয় চাই।",
  men:"Allah is the Greatest (three times). Glory be to the One who has placed this under our control, though we could never have done so on our own, and surely to our Lord we will return. O Allah, on this journey we ask You for righteousness and piety, and for deeds that please You. O Allah, make this journey easy for us and shorten its distance for us. O Allah, You are the Companion on the journey and the One who looks after the family. O Allah, I seek refuge in You from the hardships of travel, from a distressing sight, and from an evil return to my wealth and family."},
 {id:"kursi",icon:"📖",tags:["protection","dhikr"],bn:"আয়াতুল কুরসি",en:"Ayatul Kursi",kind:"quran",ref:"সূরা আল-বাকারা ২:২৫৫",refEn:"Quran, Al-Baqarah 2:255",
  ar:"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
  pr:"আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়ুল কাইয়ুম। লা তা’খুযুহু সিনাতুঁ ওয়ালা নাউম। লাহু মা ফিস সামাওয়াতি ওয়ামা ফিল আরদ। মান যাল্লাযী ইয়াশফাউ ইনদাহু ইল্লা বিইযনিহ। ইয়া’লামু মা বাইনা আইদীহিম ওয়ামা খালফাহুম। ওয়ালা ইউহীতূনা বিশাইইম মিন ইলমিহী ইল্লা বিমা শা-আ। ওয়াসিআ কুরসিইয়ুহুস সামাওয়াতি ওয়াল আরদ। ওয়ালা ইয়াউদুহু হিফযুহুমা, ওয়াহুওয়াল আলিইয়ুল আযীম।",
  mbn:"আল্লাহ—তিনি ছাড়া কোনো ইলাহ নেই; তিনি চিরঞ্জীব, সবকিছুর ধারক। তাঁকে তন্দ্রা ও নিদ্রা স্পর্শ করে না। আসমানসমূহ ও যমীনে যা কিছু আছে সব তাঁরই। কে আছে যে তাঁর অনুমতি ছাড়া তাঁর কাছে সুপারিশ করবে? তাদের সামনে ও পেছনে যা আছে তিনি জানেন। তিনি যা চান তা ছাড়া তাঁর জ্ঞানের কিছুই তারা আয়ত্ত করতে পারে না। তাঁর কুরসি আসমানসমূহ ও যমীন পরিব্যাপ্ত; এ দুটির রক্ষণাবেক্ষণ তাঁকে ক্লান্ত করে না। তিনি সর্বোচ্চ, মহান।",
  men:"Allah – there is no god except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what is behind them, and they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and preserving them does not tire Him. And He is the Most High, the Most Great."},
 {id:"quls",icon:"🌙",tags:["protection","dhikr"],bn:"তিন কুল (ইখলাস, ফালাক, নাস)",en:"The Three Quls",kind:"quran",ref:"সূরা ১১২, ১১৩, ১১৪",refEn:"Quran, Surah 112–114",
  parts:[
   {title:"সূরা আল-ইখলাস (১১২)",ar:"قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    pr:"কুল হুওয়াল্লাহু আহাদ। আল্লাহুস সামাদ। লাম ইয়ালিদ ওয়ালাম ইউলাদ। ওয়ালাম ইয়াকুল লাহু কুফুওয়ান আহাদ।",
    mbn:"বলুন, তিনি আল্লাহ, এক-অদ্বিতীয়। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি। আর তাঁর সমতুল্য কেউ নেই।",
    men:"Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him."},
   {title:"সূরা আল-ফালাক (১১৩)",ar:"قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    pr:"কুল আঊযু বিরব্বিল ফালাক। মিন শাররি মা খালাক। ওয়া মিন শাররি গাসিকিন ইযা ওয়াকাব। ওয়া মিন শাররিন নাফফাসাতি ফিল উকাদ। ওয়া মিন শাররি হাসিদিন ইযা হাসাদ।",
    mbn:"বলুন, আমি আশ্রয় চাই ঊষার রবের কাছে—তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে, অন্ধকার রাতের অনিষ্ট থেকে যখন তা আচ্ছন্ন করে, গিঁটে ফুঁ দানকারিণীদের অনিষ্ট থেকে, এবং হিংসুকের অনিষ্ট থেকে যখন সে হিংসা করে।",
    men:"Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of an envier when he envies."},
   {title:"সূরা আন-নাস (১১৪)",ar:"قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    pr:"কুল আঊযু বিরব্বিন নাস। মালিকিন নাস। ইলাহিন নাস। মিন শাররিল ওয়াসওয়াসিল খান্নাস। আল্লাযী ইউওয়াসউইসু ফী সুদূরিন নাস। মিনাল জিন্নাতি ওয়ান নাস।",
    mbn:"বলুন, আমি আশ্রয় চাই মানুষের রবের কাছে, মানুষের অধিপতির কাছে, মানুষের ইলাহের কাছে—আত্মগোপনকারী কুমন্ত্রণাদাতার অনিষ্ট থেকে, যে মানুষের অন্তরে কুমন্ত্রণা দেয়, জিন ও মানুষের মধ্য থেকে।",
    men:"Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers in the hearts of mankind, from among the jinn and mankind."}]},
 {id:"newplace",icon:"🛡️",tags:["protection","driving"],bn:"নতুন জায়গায় থামলে দোয়া",en:"Dua when stopping at a new place",kind:"hadith",ref:"সহিহ মুসলিম ২৭০৮",refEn:"Sahih Muslim 2708",grade:"সহিহ (মুসলিম)",
  ar:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
  pr:"আঊযু বিকালিমাতিল্লাহিত তাম্মাতি মিন শাররি মা খালাক।",
  mbn:"আমি আল্লাহর পরিপূর্ণ বাণীসমূহের মাধ্যমে তাঁর সৃষ্টির সকল অনিষ্ট থেকে আশ্রয় চাই।",
  men:"I seek refuge in the perfect words of Allah from the evil of what He has created.",
  note:"হাদিসে আছে, কেউ কোনো জায়গায় থেমে এটি পড়লে সেখান থেকে চলে যাওয়া পর্যন্ত কোনো কিছু তার ক্ষতি করবে না।"},
 {id:"entryexit",icon:"🚪",tags:["driving","protection"],bn:"নিরাপদে প্রবেশ ও বের হওয়ার দোয়া",en:"Dua for a good entry and exit",kind:"quran",ref:"সূরা আল-ইসরা ১৭:৮০",refEn:"Quran, Al-Isra 17:80",
  ar:"رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا",
  pr:"রব্বি আদখিলনী মুদখালা সিদকিন, ওয়া আখরিজনী মুখরাজা সিদকিন, ওয়াজআল লী মিল লাদুনকা সুলতানান নাসীরা।",
  mbn:"হে আমার রব, আমাকে প্রবেশ করান সত্য ও কল্যাণের সাথে এবং বের করুন সত্য ও কল্যাণের সাথে, আর আপনার পক্ষ থেকে আমাকে দিন সাহায্যকারী শক্তি।",
  men:"My Lord, let me enter with a truthful entrance and leave with a truthful exit, and grant me from Yourself a supporting authority.",
  note:"এটি কুরআনের আয়াতের দোয়া অংশ। গাড়িতে ওঠা বা নামার জন্য হাদিসে নির্দিষ্ট করা দোয়া নয়।"},
 {id:"return",icon:"🏁",tags:["driving"],bn:"সফর থেকে ফেরার জিকির",en:"Dhikr when returning from a journey",kind:"hadith",ref:"সহিহ মুসলিম ১৩৪২",refEn:"Sahih Muslim 1342",grade:"সহিহ (মুসলিম)",
  ar:"آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ",
  pr:"আয়িবূনা, তা-ইবূনা, আ-বিদূনা, লিরব্বিনা হা-মিদূন।",
  mbn:"আমরা প্রত্যাবর্তনকারী, তওবাকারী, ইবাদতকারী এবং আমাদের রবের প্রশংসাকারী।",
  men:"We return, repenting, worshipping and praising our Lord.",
  note:"সফর থেকে ফেরার সময় সফরের দোয়ার সাথে এটি যোগ করে পড়া হয়।"},
 {id:"istighfar",icon:"🤲",tags:["dhikr"],bn:"ইস্তিগফার",en:"Seeking forgiveness (Istighfar)",kind:"hadith",ref:"সহিহ বুখারি ৬৩০৭",refEn:"Sahih al-Bukhari 6307",grade:"সহিহ (বুখারি)",
  ar:"أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
  pr:"আস্তাগফিরুল্লাহা ওয়া আতূবু ইলাইহ।",
  mbn:"আমি আল্লাহর কাছে ক্ষমা চাই এবং তাঁর কাছে তওবা করি।",
  men:"I seek Allah's forgiveness and turn to Him in repentance.",
  note:"নবী ﷺ বলেছেন, তিনি দিনে সত্তরবারের বেশি আল্লাহর কাছে ক্ষমা চান ও তওবা করেন।"},
 {id:"salawat",icon:"✨",tags:["dhikr"],bn:"দরুদে ইব্রাহিম",en:"Salawat (Durood Ibrahim)",kind:"hadith",ref:"সহিহ বুখারি ৩৩৭০",refEn:"Sahih al-Bukhari 3370",grade:"সহিহ (বুখারি)",
  ar:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
  pr:"আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিঁও ওয়া আলা আ-লি মুহাম্মাদ, কামা সাল্লাইতা আলা ইবরাহীমা ওয়া আলা আ-লি ইবরাহীম, ইন্নাকা হামীদুম মাজীদ। আল্লাহুম্মা বা-রিক আলা মুহাম্মাদিঁও ওয়া আলা আ-লি মুহাম্মাদ, কামা বা-রাকতা আলা ইবরাহীমা ওয়া আলা আ-লি ইবরাহীম, ইন্নাকা হামীদুম মাজীদ।",
  mbn:"হে আল্লাহ, মুহাম্মাদ ও মুহাম্মাদের পরিবারের উপর রহমত বর্ষণ করুন, যেমন আপনি ইবরাহীম ও ইবরাহীমের পরিবারের উপর রহমত বর্ষণ করেছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ, মুহাম্মাদ ও মুহাম্মাদের পরিবারের উপর বরকত দিন, যেমন আপনি ইবরাহীম ও ইবরাহীমের পরিবারের উপর বরকত দিয়েছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
  men:"O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious."}
];
// Tasbih: no target is suggested except the well-known 33 for the first three.
const ISLAMIC_TASBIH=[
 {id:"subhan",ar:"سُبْحَانَ اللَّهِ",bn:"সুবহানাল্লাহ",en:"SubhanAllah",target:33},
 {id:"hamd",ar:"الْحَمْدُ لِلَّهِ",bn:"আলহামদুলিল্লাহ",en:"Alhamdulillah",target:33},
 {id:"akbar",ar:"اللَّهُ أَكْبَرُ",bn:"আল্লাহু আকবার",en:"Allahu Akbar",target:33},
 {id:"astaghfir",ar:"أَسْتَغْفِرُ اللَّهَ",bn:"আস্তাগফিরুল্লাহ",en:"Astaghfirullah",target:0},
 {id:"tahlil",ar:"لَا إِلَٰهَ إِلَّا اللَّهُ",bn:"লা ইলাহা ইল্লাল্লাহ",en:"La ilaha illallah",target:0},
 {id:"durood",ar:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",bn:"দরুদ",en:"Durood",target:0}
];
