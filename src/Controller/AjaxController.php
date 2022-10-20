<?php

namespace App\Controller;

use App\Entity\Score;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class AjaxController extends AbstractController
{
    #[Route('/ajax', name: 'app_ajax')]
    public function index(Request $request, ManagerRegistry $doctrine): Response
    {   

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $initValues = array();

        $scoreId = $_SESSION['idScore'];

        if($scoreId >= 0) {

            $score = $doctrine->getRepository(Score::class)->find($scoreId);

            $scoreScore = $score->getScore();
            $scoreScoreparam = $score->getScoreparam();

            $initValues[] = $scoreId;
            $initValues[] = $scoreScore;
            $initValues[] = $scoreScoreparam;

        } else {

            $initValues[] = $_SESSION['idScore'];
            $initValues[] = $_SESSION['meterUp'];
            $initValues[] = $_SESSION['meterDown'];
            $initValues[] = $_SESSION['composer'];
            $initValues[] = $_SESSION['title'];
            $initValues[] = $_SESSION['key'];
            $initValues[] = $_SESSION['tempo'];
            $initValues[] = $_SESSION['instruments'];
            $initValues[] = $_SESSION['idScoreLast'];
        }

        if($request->isXmlHttpRequest()) {
            
            return new JsonResponse($initValues);

        } else {
            
            return new Response("THIS IS NOT AJAX");
        }
    }
}
