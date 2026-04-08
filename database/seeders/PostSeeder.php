<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $postImages = [
            'discipline' => [
                'thumbnail' => 'posts/demo-post-discipline.svg',
                'medium' => 'posts/demo-post-discipline.svg',
                'large' => 'posts/demo-post-discipline.svg',
                'original' => 'posts/demo-post-discipline.svg',
            ],
            'leadership' => [
                'thumbnail' => 'posts/demo-post-leadership.svg',
                'medium' => 'posts/demo-post-leadership.svg',
                'large' => 'posts/demo-post-leadership.svg',
                'original' => 'posts/demo-post-leadership.svg',
            ],
            'wellbeing' => [
                'thumbnail' => 'posts/demo-post-wellbeing.svg',
                'medium' => 'posts/demo-post-wellbeing.svg',
                'large' => 'posts/demo-post-wellbeing.svg',
                'original' => 'posts/demo-post-wellbeing.svg',
            ],
            'business' => [
                'thumbnail' => 'posts/demo-post-business.svg',
                'medium' => 'posts/demo-post-business.svg',
                'large' => 'posts/demo-post-business.svg',
                'original' => 'posts/demo-post-business.svg',
            ],
            'speaking' => [
                'thumbnail' => 'posts/demo-post-speaking.svg',
                'medium' => 'posts/demo-post-speaking.svg',
                'large' => 'posts/demo-post-speaking.svg',
                'original' => 'posts/demo-post-speaking.svg',
            ],
            'deepwork' => [
                'thumbnail' => 'posts/demo-post-deepwork.svg',
                'medium' => 'posts/demo-post-deepwork.svg',
                'large' => 'posts/demo-post-deepwork.svg',
                'original' => 'posts/demo-post-deepwork.svg',
            ],
        ];

        $posts = [
            [
                'title'   => 'Comment développer une discipline de fer en 30 jours',
                'excerpt' => 'La discipline n\'est pas un talent, c\'est une habitude. Découvrez les 5 pratiques quotidiennes qui transforment vos intentions en actions concrètes.',
                'tags'    => ['discipline', 'habitudes', 'croissance'],
                'category' => 'Développement personnel',
                'content' => '<p>La discipline est souvent perçue comme une qualité innée que certains possèdent et d\'autres non. Cette croyance est fausse. La discipline se construit, se nourrit, se renforce chaque jour.</p><h2>1. Commencer petit</h2><p>Le plus grand ennemi de la discipline est l\'excès d\'ambition au départ. Commencez par une habitude de 5 minutes par jour, puis augmentez progressivement.</p><h2>2. Lier les habitudes</h2><p>Attachez votre nouvelle habitude à une habitude existante. Après mon café du matin, je médite 10 minutes.</p><h2>3. Mesurer les progrès</h2><p>Ce qui se mesure s\'améliore. Tenez un journal simple, cochez chaque jour réussi.</p>',
                'featured_image' => $postImages['discipline'],
            ],
            [
                'title'   => 'Les 7 piliers d\'un leadership authentique',
                'excerpt' => 'Un leader authentique n\'imite personne. Il construit sa propre vision et inspire par l\'exemple. Voici les 7 principes fondateurs.',
                'tags'    => ['leadership', 'management', 'influence'],
                'category' => 'Leadership',
                'content' => '<p>Le leadership authentique repose sur une connaissance profonde de soi-même. Avant de guider les autres, vous devez vous connaître.</p><h2>Pilier 1 : Connaissance de soi</h2><p>Faites l\'inventaire de vos forces, vos faiblesses, vos valeurs profondes. Cette clarté est le fondement de tout le reste.</p><h2>Pilier 2 : Communication claire</h2><p>Un leader qui ne communique pas clairement crée de la confusion. Apprenez à exprimer votre vision en phrases simples et mémorables.</p><h2>Pilier 3 : Responsabilité</h2><p>Assumer ses erreurs avant de pointer les autres. Cette posture crée la confiance.</p>',
                'featured_image' => $postImages['leadership'],
            ],
            [
                'title'   => 'Gérer l\'anxiété de performance : le guide pratique',
                'excerpt' => 'L\'anxiété de performance touche 9 professionnels sur 10. Ce n\'est pas une faiblesse, c\'est un signal. Apprenez à l\'utiliser comme carburant.',
                'tags'    => ['bien-être', 'anxiété', 'performance', 'santé mentale'],
                'category' => 'Bien-être',
                'content' => '<p>L\'anxiété de performance est une réponse normale à des enjeux importants. Le problème n\'est pas l\'anxiété elle-même, mais notre relation à elle.</p><h2>Comprendre le signal</h2><p>L\'anxiété vous informe que vous tenez à ce que vous faites. C\'est de l\'énergie brute. Votre rôle est de la canaliser, pas de l\'éliminer.</p><h2>La technique du recadrage</h2><p>Au lieu de penser "je suis stressé(e)", dites-vous "je suis excité(e)". La physiologie est identique, l\'interprétation change tout.</p>',
                'featured_image' => $postImages['wellbeing'],
            ],
            [
                'title'   => 'Lancer son entreprise avec 0€ : mythe ou réalité ?',
                'excerpt' => 'On vous dit qu\'il faut des millions pour entreprendre. La vérité est bien différente. Voici comment 3 entrepreneurs ont tout démarré avec zéro capital.',
                'tags'    => ['entrepreneuriat', 'startup', 'financement'],
                'category' => 'Entrepreneuriat',
                'content' => '<p>Le capital de départ est souvent surestimé. Ce dont vous avez vraiment besoin, c\'est d\'une compétence monnayable et d\'un premier client.</p><h2>Le modèle du service</h2><p>La façon la plus rapide de générer du revenu est de vendre votre expertise comme service. Pas de stock, pas de logistique, juste de la valeur humaine.</p><h2>Valider avant d\'investir</h2><p>Avant de dépenser un seul euro, obtenez une promesse d\'achat ou un premier paiement. La validation du marché est la seule certitude qui compte.</p>',
                'featured_image' => $postImages['business'],
            ],
            [
                'title'   => 'L\'art de la prise de parole en public : vaincre sa peur',
                'excerpt' => 'La prise de parole en public est classée comme la peur numéro 1 dans le monde. Voici comment la transformer en super-pouvoir.',
                'tags'    => ['communication', 'prise de parole', 'confiance'],
                'category' => 'Communication',
                'content' => '<p>La peur de parler en public est universelle. Même les plus grands orateurs l\'ont ressentie. La différence : ils ont appris à l\'apprivoiser.</p><h2>La préparation comme bouclier</h2><p>80% de la confiance vient de la préparation. Connaissez votre sujet, votre opening, votre closing. Le reste coule naturellement.</p><h2>Le regard connecté</h2><p>Ne regardez pas au-dessus des têtes. Connectez-vous avec une personne à la fois, 3 secondes par regard. Cela crée une intimité avec toute la salle.</p>',
                'featured_image' => $postImages['speaking'],
            ],
            [
                'title'   => 'Deep work : comment produire plus en travaillant moins',
                'excerpt' => 'La productivité n\'est pas une question de quantité d\'heures. C\'est une question de concentration profonde. Voici la méthode.',
                'tags'    => ['productivité', 'deep work', 'concentration', 'focus'],
                'category' => 'Productivité',
                'content' => '<p>Cal Newport a popularisé le concept de Deep Work : des périodes de concentration intense sans distraction. 4 heures de deep work valent 8 heures de travail fragmenté.</p><h2>Bloquer le temps</h2><p>Réservez des blocs de 90 à 120 minutes dans votre agenda. Ces blocs sont sacrés, non négociables.</p><h2>Éliminer les distractions</h2><p>Téléphone en mode avion, notifications coupées, porte fermée. L\'environnement doit soutenir votre intention.</p><h2>Le rituel d\'entrée</h2><p>Créez un signal de début : une musique, un café, une phrase écrite. Ce rituel conditionne votre cerveau à entrer en mode focus.</p>',
                'featured_image' => $postImages['deepwork'],
            ],
        ];

        foreach ($posts as $data) {
            $slug = Str::slug($data['title']);
            $post = Post::updateOrCreate(
                ['slug' => $slug],
                [
                    'title'          => $data['title'],
                    'excerpt'        => $data['excerpt'],
                    'content'        => $data['content'],
                    'featured_image' => $data['featured_image'],
                    'tags'           => $data['tags'],
                    'published'      => true,
                    'published_at'   => now()->subDays(random_int(1, 90)),
                    'user_id'        => $admin->id,
                ]
            );

            $category = Category::where('name', $data['category'])->first();
            if ($category) {
                $post->categories()->syncWithoutDetaching([$category->id]);
            }
        }
    }
}
