<?php

namespace App\Controller;

use App\Entity\Score;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class AjaxSaveParamsController extends AbstractController
{
    #[Route('/ajaxSaveParams', name: 'app_ajax_save_params')]
    public function index(Request $request, ManagerRegistry $doctrine): Response
    {   

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $scoreJSONstring = file_get_contents("php://input");
        $scoreJSON = json_decode($scoreJSONstring, TRUE);

        $em = $doctrine->getManager();

        $score = $em->getRepository(Score::class)->find($_SESSION['idScoreLast']);
        $score->setScoreParam($scoreJSON);
        
        $em->flush();

        return new Response("SCORE PARAMS SAVED");
    }
}
