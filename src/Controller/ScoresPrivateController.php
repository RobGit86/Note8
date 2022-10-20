<?php

namespace App\Controller;

use App\Entity\Score;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ScoresPrivateController extends AbstractController
{
    #[Route('/scores/private', name: 'app_scores_private')]
    public function index(ManagerRegistry $doctrine): Response
    {

        $logged = $this->isGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();

        $id = $user->getId();

        $scoresRepo = $doctrine->getRepository(Score::class);

        $scores = $scoresRepo->findBy(
            ['user' => $user]
        );

        return $this->render('scores_private/index.html.twig', [
            'logged' => $logged,
            'user' => $user,
            'scores' => $scores,
            'controller_name' => 'ScoresPrivateController',
        ]);
    }

    #[Route('/scores/private/publish', name: 'app_scores_private_publish')]
    public function publish(Request $request, ManagerRegistry $doctrine): Response
    {

        $em = $doctrine->getManager();

        $scoresRepo = $doctrine->getRepository(Score::class);
        
        $idScore = $request->get('idScorePublish');

        $score = $scoresRepo->find($idScore);
        
        if($score->isPublic()) {
            $score->setPublic(false);
        } else {
            $score->setPublic(true);
        }
        
        $em->flush();
        
        return $this->redirectToRoute('app_scores_private');

    }

    #[Route('/scores/private/remove', name: 'app_scores_private_remove')]
    public function remove(Request $request, ManagerRegistry $doctrine): Response
    {

        $em = $doctrine->getManager();

        $scoresRepo = $doctrine->getRepository(Score::class);
        
        $idScore = $request->get('idScoreRemove');

        $score = $scoresRepo->find($idScore);
    
        $em->remove($score);
        $em->flush();
        
        return $this->redirectToRoute('app_scores_private');
    }
}
