export interface GitHubStatsResponse {
  statsImageUrl: string;
  languagesImageUrl: string;
  isAvailable: boolean;
  error?: string;
  isSvg?: boolean;
}

export class GitHubStatsService {
  
  static async fetchGitHubStats(username: string, languageCount: number = 15): Promise<GitHubStatsResponse> {
    // Normalize username to lowercase for consistency
    const normalizedUsername = username.toLowerCase();
    console.log(`📊 Fetching GitHub stats for ${normalizedUsername} (normalized from ${username}) with ${languageCount} languages`);
    
    // Try different approaches to get React Native compatible images
    const statsUrl = `https://github-readme-stats.vercel.app/api?username=${normalizedUsername}&show_icons=true&count_private=true&include_all_commits=true&theme=dark&hide_border=true&bg_color=0d1117`;
    const languagesUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${normalizedUsername}&layout=compact&langs_count=${languageCount}&theme=dark&hide_border=true&bg_color=0d1117`;
    
    try {
      console.log('🔗 Stats URL:', statsUrl);
      console.log('🔗 Languages URL:', languagesUrl);
      
      // First, validate that the user exists with the correct case
      const userValidation = await this.validateAndGetCorrectUsername(username);
      if (!userValidation.exists) {
        return {
          statsImageUrl: statsUrl,
          languagesImageUrl: languagesUrl,
          isAvailable: false,
          error: `User ${username} not found on GitHub`
        };
      }
      
      // Use the correct case username for the final URLs
      const correctUsername = userValidation.correctUsername;
      const finalStatsUrl = statsUrl.replace(normalizedUsername, correctUsername);
      const finalLanguagesUrl = languagesUrl.replace(normalizedUsername, correctUsername);
      
      console.log('✅ Using correct username:', correctUsername);
      console.log('🔗 Final Stats URL:', finalStatsUrl);
      console.log('🔗 Final Languages URL:', finalLanguagesUrl);
      
      const [statsResponse, languagesResponse] = await Promise.all([
        fetch(finalStatsUrl, { 
          method: 'GET',
          headers: {
            'Accept': 'image/png, image/jpeg, image/webp, image/*',
            'User-Agent': 'DevTracker-App/1.0'
          }
        }),
        fetch(finalLanguagesUrl, { 
          method: 'GET',
          headers: {
            'Accept': 'image/png, image/jpeg, image/webp, image/*',
            'User-Agent': 'DevTracker-App/1.0'
          }
        })
      ]);
      
      console.log('📊 Stats API Response:', {
        status: statsResponse.status,
        statusText: statsResponse.statusText,
        contentType: statsResponse.headers.get('content-type'),
        contentLength: statsResponse.headers.get('content-length')
      });
      
      console.log('🌐 Languages API Response:', {
        status: languagesResponse.status,
        statusText: languagesResponse.statusText,
        contentType: languagesResponse.headers.get('content-type'),
        contentLength: languagesResponse.headers.get('content-length')
      });
      
      if (statsResponse.ok && languagesResponse.ok) {
        const statsContentType = statsResponse.headers.get('content-type') || '';
        const languagesContentType = languagesResponse.headers.get('content-type') || '';
        
        console.log('✅ Both GitHub stats APIs responded successfully');
        console.log('📄 Content types:', { statsContentType, languagesContentType });
        
        const isSvg = statsContentType.includes('svg') || languagesContentType.includes('svg');
        
        return {
          statsImageUrl: finalStatsUrl,
          languagesImageUrl: finalLanguagesUrl,
          isAvailable: true,
          isSvg
        };
      } else {
        console.warn('⚠️ One or both GitHub stats APIs failed:', {
          statsOk: statsResponse.ok,
          languagesOk: languagesResponse.ok
        });
        
        return {
          statsImageUrl: finalStatsUrl,
          languagesImageUrl: finalLanguagesUrl,
          isAvailable: false,
          error: `Stats: ${statsResponse.status}, Languages: ${languagesResponse.status}`
        };
      }
      
    } catch (error) {
      console.error('❌ GitHub stats API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        statsImageUrl: statsUrl,
        languagesImageUrl: languagesUrl,
        isAvailable: false,
        error: errorMessage
      };
    }
  }
  
  static async validateAndGetCorrectUsername(username: string): Promise<{ exists: boolean; correctUsername: string }> {
    console.log(`🔍 Validating GitHub username: ${username}`);
    
    try {
      // Try the username as provided first
      let response = await fetch(`https://api.github.com/users/${username}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log(`✅ Found user with exact case: ${userData.login}`);
        return { exists: true, correctUsername: userData.login };
      }
      
      // If that fails, try lowercase
      const lowercaseUsername = username.toLowerCase();
      if (lowercaseUsername !== username) {
        response = await fetch(`https://api.github.com/users/${lowercaseUsername}`);
        
        if (response.ok) {
          const userData = await response.json();
          console.log(`✅ Found user with lowercase: ${userData.login}`);
          return { exists: true, correctUsername: userData.login };
        }
      }
      
      // If that fails, try with first letter capitalized
      const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
      if (capitalizedUsername !== username && capitalizedUsername !== lowercaseUsername) {
        response = await fetch(`https://api.github.com/users/${capitalizedUsername}`);
        
        if (response.ok) {
          const userData = await response.json();
          console.log(`✅ Found user with capitalized: ${userData.login}`);
          return { exists: true, correctUsername: userData.login };
        }
      }
      
      console.warn(`❌ User not found with any case variation: ${username}`);
      return { exists: false, correctUsername: username };
      
    } catch (error) {
      console.error('❌ Username validation failed:', error);
      return { exists: false, correctUsername: username };
    }
  }
  
  static getWebViewUrls(username: string, languageCount: number = 15) {
    // Return HTML wrapper URLs that can be displayed in WebView
    return {
      statsWebView: `data:text/html;charset=utf-8,<html><body style="margin:0;padding:0;background:transparent;"><img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&count_private=true&include_all_commits=true&theme=transparent&hide_border=true&bg_color=00000000" style="width:100%;height:auto;" /></body></html>`,
      languagesWebView: `data:text/html;charset=utf-8,<html><body style="margin:0;padding:0;background:transparent;"><img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&langs_count=${languageCount}&theme=transparent&hide_border=true&bg_color=00000000" style="width:100%;height:auto;" /></body></html>`
    };
  }
  
  static getAlternativeImageUrls(username: string, languageCount: number = 15) {
    // Try different services that might return PNG
    return {
      // GitHub Profile Summary Cards (returns PNG)
      profileSummary: `https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}&theme=transparent`,
      
      // GitHub Streak Stats (supports PNG)
      streakStats: `https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=transparent&hide_border=true&background=00000000`,
      
      // Activity Graph
      activityGraph: `https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=transparent&hide_border=true&bg_color=00000000`,
      
      // Profile Trophy
      trophyStats: `https://github-profile-trophy.vercel.app/?username=${username}&theme=transparent&no-frame=true&no-bg=true&margin-w=4&row=2&column=3`,
    };
  }
  
  static async validateStatsAvailability(username: string): Promise<boolean> {
    const validation = await this.validateAndGetCorrectUsername(username);
    return validation.exists;
  }
}
