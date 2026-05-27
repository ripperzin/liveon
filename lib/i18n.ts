import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

let deviceLanguage = 'en';
try {
  const { getLocales } = require('expo-localization');
  deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
} catch {
  deviceLanguage = 'en';
}

const resources = {
  en: {
    translation: {
      // Common
      app_name: 'Live ON',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      continue: 'Continue',
      back: 'Back',
      done: 'Done',
      error: 'Error',
      success: 'Success',

      // Auth
      auth: {
        login: 'Log In',
        signup: 'Sign Up',
        email: 'Email',
        password: 'Password',
        confirm_password: 'Confirm Password',
        forgot_password: 'Forgot Password?',
        or_continue_with: 'or continue with',
        no_account: "Don't have an account?",
        has_account: 'Already have an account?',
        logout: 'Log Out',
      },

      // Onboarding
      onboarding: {
        welcome_title: 'Welcome to Live ON',
        welcome_subtitle: 'Level up in real life',
        slide1_title: 'Build Healthy Habits',
        slide1_desc: 'Transform your daily routines into quests and earn XP for every achievement',
        slide2_title: 'Evolve Your Character',
        slide2_desc: 'Watch your avatar grow stronger as you improve your real-life stats',
        slide3_title: 'Play Together',
        slide3_desc: 'Join friends, compete in rankings, and tackle challenges together',
        create_avatar: 'Create Your Avatar',
        choose_habits: 'Choose Your Starting Habits',
        choose_habits_desc: 'Select at least 2 habits to begin your journey',
        start_journey: 'Start Your Journey',
      },

      // Tabs
      tabs: {
        home: 'Home',
        habits: 'Habits',
        avatar: 'Avatar',
        social: 'Social',
        quests: 'Quests',
      },

      // Home
      home: {
        good_morning: 'Good Morning',
        good_afternoon: 'Good Afternoon',
        good_evening: 'Good Evening',
        level: 'Level',
        daily_progress: 'Daily Progress',
        streak: 'Streak',
        days: 'days',
        today_quests: "Today's Quests",
        quick_actions: 'Quick Actions',
      },

      // Habits
      habits: {
        title: 'My Habits',
        check_in: 'Check In',
        completed: 'Completed!',
        water: 'Drink Water',
        exercise: 'Exercise',
        reading: 'Reading',
        screen_free: 'Screen-Free Time',
        xp_earned: '+{{xp}} XP',
        streak_count: '{{count}} day streak',
      },

      // Avatar
      avatar: {
        title: 'My Character',
        attributes: 'Attributes',
        achievements: 'Achievements',
        stats: 'Stats',
      },

      // Social
      social: {
        title: 'Social',
        friends: 'Friends',
        ranking: 'Ranking',
        add_friend: 'Add Friend',
        friend_code: 'Friend Code',
        weekly_ranking: 'Weekly Ranking',
        online: 'Online',
        offline: 'Offline',
      },

      // Quests
      quests: {
        title: 'Quests',
        daily: 'Daily',
        weekly: 'Weekly',
        special: 'Special',
        reward: 'Reward',
        progress: 'Progress',
        complete: 'Complete',
      },

      // Attributes
      attributes: {
        vitality: 'Vitality',
        strength: 'Strength',
        intelligence: 'Intelligence',
        focus: 'Focus',
        clarity: 'Mental Clarity',
        charisma: 'Charisma',
        mindfulness: 'Mindfulness',
        recovery: 'Recovery',
      },

      // Feedback
      feedback: {
        level_up: 'LEVEL UP!',
        level_reached: 'You reached level {{level}}!',
        xp_gained: '+{{xp}} XP gained!',
        coins_gained: '+{{coins}} coins earned!',
        streak_milestone: '🔥 {{days}} day streak!',
        habit_completed: 'Habit completed!',
      },
    },
  },
  pt: {
    translation: {
      // Common
      app_name: 'Live ON',
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      continue: 'Continuar',
      back: 'Voltar',
      done: 'Concluído',
      error: 'Erro',
      success: 'Sucesso',

      // Auth
      auth: {
        login: 'Entrar',
        signup: 'Criar Conta',
        email: 'E-mail',
        password: 'Senha',
        confirm_password: 'Confirmar Senha',
        forgot_password: 'Esqueceu a senha?',
        or_continue_with: 'ou continue com',
        no_account: 'Não tem uma conta?',
        has_account: 'Já tem uma conta?',
        logout: 'Sair',
      },

      // Onboarding
      onboarding: {
        welcome_title: 'Bem-vindo ao Live ON',
        welcome_subtitle: 'Upe na vida real',
        slide1_title: 'Construa Hábitos Saudáveis',
        slide1_desc: 'Transforme suas rotinas diárias em missões e ganhe XP por cada conquista',
        slide2_title: 'Evolua Seu Personagem',
        slide2_desc: 'Veja seu avatar ficar mais forte conforme você melhora seus atributos reais',
        slide3_title: 'Jogue com Amigos',
        slide3_desc: 'Junte-se a amigos, dispute rankings e enfrente desafios juntos',
        create_avatar: 'Crie Seu Avatar',
        choose_habits: 'Escolha Seus Hábitos Iniciais',
        choose_habits_desc: 'Selecione pelo menos 2 hábitos para começar sua jornada',
        start_journey: 'Começar Jornada',
      },

      // Tabs
      tabs: {
        home: 'Início',
        habits: 'Hábitos',
        avatar: 'Avatar',
        social: 'Social',
        quests: 'Missões',
      },

      // Home
      home: {
        good_morning: 'Bom Dia',
        good_afternoon: 'Boa Tarde',
        good_evening: 'Boa Noite',
        level: 'Nível',
        daily_progress: 'Progresso Diário',
        streak: 'Streak',
        days: 'dias',
        today_quests: 'Missões de Hoje',
        quick_actions: 'Ações Rápidas',
      },

      // Habits
      habits: {
        title: 'Meus Hábitos',
        check_in: 'Registrar',
        completed: 'Concluído!',
        water: 'Beber Água',
        exercise: 'Exercício Físico',
        reading: 'Leitura',
        screen_free: 'Tempo sem Telas',
        xp_earned: '+{{xp}} XP',
        streak_count: '{{count}} dias de streak',
      },

      // Avatar
      avatar: {
        title: 'Meu Personagem',
        attributes: 'Atributos',
        achievements: 'Conquistas',
        stats: 'Estatísticas',
      },

      // Social
      social: {
        title: 'Social',
        friends: 'Amigos',
        ranking: 'Ranking',
        add_friend: 'Adicionar Amigo',
        friend_code: 'Código de Amigo',
        weekly_ranking: 'Ranking Semanal',
        online: 'Online',
        offline: 'Offline',
      },

      // Quests
      quests: {
        title: 'Missões',
        daily: 'Diárias',
        weekly: 'Semanais',
        special: 'Especiais',
        reward: 'Recompensa',
        progress: 'Progresso',
        complete: 'Completar',
      },

      // Attributes
      attributes: {
        vitality: 'Vitalidade',
        strength: 'Força',
        intelligence: 'Inteligência',
        focus: 'Foco',
        clarity: 'Clareza Mental',
        charisma: 'Carisma',
        mindfulness: 'Controle Mental',
        recovery: 'Recuperação',
      },

      // Feedback
      feedback: {
        level_up: 'SUBIU DE NÍVEL!',
        level_reached: 'Você alcançou o nível {{level}}!',
        xp_gained: '+{{xp}} XP ganhos!',
        coins_gained: '+{{coins}} moedas ganhas!',
        streak_milestone: '🔥 {{days}} dias de streak!',
        habit_completed: 'Hábito concluído!',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage.startsWith('pt') ? 'pt' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
