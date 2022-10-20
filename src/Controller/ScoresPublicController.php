<?php

namespace App\Controller;

use App\Entity\Score;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ScoresPublicController extends AbstractController
{
    #[Route('/scores/public', name: 'app_scores_public')]
    public function index(Request $request, ManagerRegistry $doctrine): Response
    {   

        $logged = $this->isGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();

        $scores = $doctrine->getRepository(Score::class)->findBy(['public' => true]);
        
        $searchedScore = $request->get('searchScore');

        if(isset($searchedScore)) {

            $results = array();

            foreach($scores as $score) {

                $title = strtolower($score->getTitle());
                $searchedScore = strtolower($_POST['searchScore']);

                if($title === $searchedScore) {
                    $results[] = $score;
                }
            }

            $scores = $results;

            $this->addFlash(
                'found',
                'Znaleziono '. count($results) . ' utworów o tytule ' . $searchedScore
            );
        }

        return $this->render('scores_public/index.html.twig', [
            'logged' => $logged,
            'user' => $user,
            'scores' => $scores,
            'controller_name' => 'ScoresPublicController',
        ]);
    }
}
